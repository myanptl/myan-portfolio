/*
 * The 3D stage: renderer, lighting, explode, focus, hover.
 *
 * The single highest-leverage line in this file is the pixel-ratio cap. On a
 * retina display, rendering at 1.5 instead of the device's own 2 or 3 cuts
 * shader workload by roughly 44% with no visible difference on a scene made of
 * smooth metal. It is not a knob to raise.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildEngine } from './turbofan.js';
import { createSpring } from '../lib/spring.js';
import { onFrame, clamp, lerp } from '../lib/frame.js';

/*
 * Spool speeds, in radians per second, and the whole reason for this rebuild.
 *
 * These are NOT gated on the explode. The previous object stopped every moving
 * part the moment it opened, so the entire teardown, which is the part anyone
 * actually scrolls through, was a still image.
 *
 * Both are far slower than the real thing, for one reason: aliasing. Twenty fan
 * blades at a true 2 500 rpm cross the frame 830 times a second, and on a 60 Hz
 * display that is not rotation, it is a strobe. At 0.54 rev/s the fan passes
 * eleven blades a second and reads as unmistakably turning. The high spool runs
 * 2.4x faster and the other way, which is what makes the two legible as two.
 */
const LP_RATE = 3.4;
const HP_RATE = -8.2;

// Widest a part label gets, plus its gap. Used to decide when to flip it.
const HOT_LABEL_W = 210;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * @param host      element the canvas is appended into
 * @param hotspotHost  element the geometry-pinned label lives in
 *
 * The canvas is CREATED here rather than handed in from JSX on purpose. A
 * canvas element keeps one WebGL context for its whole life, so reusing a
 * React-rendered one means StrictMode's second mount gets the context the first
 * mount already tore down, and the page renders nothing with no error. Owning
 * the element means every mount gets a genuinely fresh context.
 */
export function createStage(host, hotspotHost) {
  const still = reduced();
  const disposers = [];

  const renderer = new THREE.WebGLRenderer({
    antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  const canvas = renderer.domElement;
  canvas.className = 'stage__canvas';
  host.appendChild(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;

  const scene = new THREE.Scene();

  // Image-based lighting with no asset to download. RoomEnvironment is
  // generated in-engine, which is what makes the metals read as metal without
  // shipping an HDR, and the platters need a real environment or a mirror
  // finish has nothing to be a mirror of.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;

  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 140);

  const { engine, parts, size, explodedWidth } = buildEngine();
  scene.add(engine);

  // Frame from the engine's own bounds, so changing the geometry never silently
  // crops it.


  /**
   * Distance at which a world-space box of w x h fills `fill` of the frame.
   *
   * Ignoring aspect and framing on max(x, y) is the classic error here: a
   * 5.84-long drive constrained as if it were 5.84 TALL parks the camera about
   * twice as far out as it needs to, and the object renders tiny on a wide
   * monitor while looking correct on a laptop.
   */
  function distFor(w, h, fill) {
    const vFov = (camera.fov * Math.PI) / 180;
    const dH = h / 2 / Math.tan(vFov / 2);
    const dW = w / 2 / (Math.tan(vFov / 2) * camera.aspect);
    return Math.max(dH, dW) / fill;
  }

  let distAssembled = 1;
  let distExploded = 1;
  function recomputeFraming() {
    /*
     * The fill fraction has to come down on a portrait viewport.
     *
     * distFor already accounts for aspect, so the object fits the frame it was
     * measured against. What it cannot know is that the object is ORBITED: at a
     * yaw of half a radian the engine's projected width is wider than the
     * length it was framed on, and on a wide screen the spare margin absorbs
     * that while on a phone it does not. Less fill is the margin.
     */
    const narrow = innerWidth / innerHeight < 1.25;
    // Foreshortening: seen from a raised three-quarter angle the engine's
    // length projects shorter, so framing on raw length leaves dead space
    // either side. Exploding widens the object rather than heightening it,
    // because the explode runs along the same axis as its own length.
    distAssembled = distFor(size.x * 0.86, size.y, narrow ? 0.52 : 0.66);
    // Framed from the packed row's MEASURED width. Estimating it was the bug
    // that put the cowl across half the screen: the widest single part is
    // nearly as long as the assembled engine, so any guess based on the
    // assembled size is short by most of a nacelle.
    distExploded = distFor(explodedWidth, size.y, narrow ? 0.72 : 0.88);
  }
  recomputeFraming();

  /* Lighting. Warm key against a cool rim: metal needs two different colour
     temperatures to separate its faces, and that separation is what stops a
     grey object reading as a flat grey silhouette. Both travel with the camera
     so the key never falls behind the subject. */
  const key = new THREE.DirectionalLight(0xfff4e8, 2.0);
  key.position.set(4, 7, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xaeb6c0, 1.25);
  rim.position.set(-5, -2, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.16));

  /* Springs ------------------------------------------------------------- */
  const explode = createSpring({ stiffness: 90, damping: 20 });
  const camDist = createSpring({ stiffness: 70, damping: 18, value: distAssembled });
  const yaw = createSpring({ stiffness: 60, damping: 16 });
  const pitch = createSpring({ stiffness: 60, damping: 16, value: 0.36 });
  const ptrX = createSpring({ stiffness: 45, damping: 14 });
  const ptrY = createSpring({ stiffness: 45, damping: 14 });
  // Screen-space composition. Lets a section push the drive off centre so the
  // type has its own column instead of colliding with the object.
  const panX = createSpring({ stiffness: 60, damping: 18 });
  const panY = createSpring({ stiffness: 60, damping: 18 });
  // Axial tracking, so the camera rides ALONG the engine as the caption walks
  // and brings the named part toward the middle of the frame.
  const followX = createSpring({ stiffness: 55, damping: 17 });
  // Global dim gate. At 0 nothing recedes, which is correct while the drive is
  // opening or closing; at 1 the unselected parts fall back so the named one is
  // unmistakable.
  const focusMode = createSpring({ stiffness: 90, damping: 20 });
  parts.forEach((p) => {
    p.userData.offset = createSpring({ stiffness: 110, damping: 21 });
    // One highlight value per part, driven by BOTH hover and the scroll walk.
    // Two separate values would fight whenever a visitor hovers the part the
    // scroll has already selected.
    p.userData.hi = createSpring({ stiffness: 190, damping: 21 });
  });

  let focused = null;
  // Last distance asked for by the section, kept so releasing a focus can fall
  // back to it rather than to a guess.
  let framed = distAssembled;

  /* Hover ---------------------------------------------------------------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(-2, -2);
  let hovered = null;
  let interactive = false;

  // Built with DOM methods rather than innerHTML. The markup is a static
  // literal today, but the text node it wraps is written from part data every
  // frame, exactly the shape that turns into an injection the moment part
  // names come from anywhere but this repo.
  const hotspot = document.createElement('div');
  hotspot.className = 'hot';
  // An inner box so the label can flip to the other side of the dot without
  // fighting the inline transform that positions the whole thing.
  const hotInner = document.createElement('div');
  hotInner.className = 'hot__inner';
  const hotDot = document.createElement('span');
  hotDot.className = 'hot__dot';
  const hotText = document.createElement('span');
  hotText.className = 'hot__text';
  hotInner.append(hotDot, hotText);
  hotspot.appendChild(hotInner);
  hotspotHost.appendChild(hotspot);

  const onPointerMove = (e) => {
    ndc.x = (e.clientX / innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / innerHeight) * 2 + 1;
    ptrX.target = ndc.x;
    ptrY.target = ndc.y;
  };
  addEventListener('pointermove', onPointerMove, { passive: true });
  disposers.push(() => removeEventListener('pointermove', onPointerMove));

  const onResize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    // Framing depends on aspect, so it has to be recomputed here or the drive
    // is mis-scaled on every resize and on phone rotation.
    recomputeFraming();
  };
  addEventListener('resize', onResize);
  disposers.push(() => removeEventListener('resize', onResize));

  /* Never render while the canvas is off screen or the tab is hidden. This is
     the difference between a page that idles at 0% CPU and one that cooks a
     laptop in a background tab. */
  let onScreen = true;
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);
  disposers.push(() => io.disconnect());

  const tmp = new THREE.Vector3();
  const right = new THREE.Vector3();
  const panVec = new THREE.Vector3();
  const follow = new THREE.Vector3();
  const anchorOf = (p, out) => out.copy(p.userData.anchor).applyMatrix4(p.matrixWorld);

  let lpPhase = 0;
  let hpPhase = 0;

  const stop = onFrame((dt) => {
    if (!onScreen || document.hidden) return;

    [explode, camDist, yaw, pitch, ptrX, ptrY, panX, panY, focusMode]
      .forEach((s) => s.step(dt));

    // Partial tracking, not full centring. Following the part all the way to
    // the middle of the frame pushes the rest of the stack off the bottom and
    // loses the sense of an assembly; 0.6 improves the viewing angle while
    // keeping the neighbouring layers in shot for context.
    followX.target = focused ? anchorOf(focused, follow).x * 0.7 : 0;
    followX.step(dt);

    const e = clamp(explode.value, 0, 1);
    const fm = focusMode.value;

    parts.forEach((p) => {
      const u = p.userData;
      /*
       * Lerp from where the part really sits to its slot in the packed row,
       * rather than adding an offset to where it sits.
       *
       * The engine comes apart along its LONG axis, which is the opposite
       * situation to a laminated stack: the parts are already spread across six
       * units before anything moves, so adding offsets would only stretch an
       * arrangement that is already too wide. The target positions are computed
       * once in turbofan.js, packed by each part's real size.
       */
      u.offset.target = e;
      u.offset.step(dt);
      u.hi.target = hovered === p || focused === p ? 1 : 0;
      u.hi.step(dt);
      p.position.x = lerp(u.home.x, u.exploded, clamp(u.offset.value, 0, 1));

      // Everything that is not the named part recedes, and the named one is
      // pushed slightly past its own baseline so it gains rather than merely
      // failing to lose.
      //
      // Dimming avoids opacity on purpose: transparency would force depth
      // sorting across seven interleaved layers and the first wrong sort is
      // very visible. But envMapIntensity ALONE is not a dim: on a saturated
      // metal, less reflected environment reveals MORE of the base colour, so
      // the copper coil actually grows more vivid as it recedes. The colour has
      // to come down with it.
      const k = 1 - fm * 0.72 * (1 - u.hi.value);
      const lift = 1 + fm * u.hi.value * 0.18;
      for (const m of u.mats) {
        m.mat.envMapIntensity = m.env * k * lift;
        m.mat.color.copy(m.col).multiplyScalar(k * lift);
      }
    });

    /*
     * Both spools turn continuously, open or closed. An exploded engine whose
     * rotors have stopped is a diagram; one still spinning is a machine that
     * happens to be apart, and it is the only thing on the page that keeps
     * moving while you read.
     */
    if (!still) {
      lpPhase += dt * LP_RATE;
      hpPhase += dt * HP_RATE;
    }
    for (const p of parts) {
      const spin = p.userData.spin;
      if (spin === 'lp') p.rotation.x = lpPhase;
      else if (spin === 'hp') p.rotation.x = hpPhase;
      else if (spin === 'both') {
        // The shafts carry one of each, which is the clearest place on the
        // whole engine to see that there are two of them.
        p.userData.spools.lp.rotation.x = lpPhase;
        p.userData.spools.hp.rotation.x = hpPhase;
      }
    }

    /* Camera. Orbit from the springs, with pointer parallax layered on top. */
    const py = pitch.value + ptrY.value * 0.15;
    const ya = yaw.value + ptrX.value * 0.3;
    const d = camDist.value;
    camera.position.set(
      Math.sin(ya) * Math.cos(py) * d,
      Math.sin(py) * d,
      Math.cos(ya) * Math.cos(py) * d,
    );

    // True pan: shift the camera AND its target by the same vector, so the
    // object slides across the frame without the perspective skewing. Rotating
    // the lookAt instead would swing the drive rather than move it.
    const vFov = (camera.fov * Math.PI) / 180;
    const halfH = Math.tan(vFov / 2) * d;
    right.set(Math.cos(ya), 0, -Math.sin(ya));
    panVec.copy(right).multiplyScalar(panX.value * halfH * camera.aspect);
    // followX is already in world units along the engine's own axis, so it is
    // added directly rather than scaled by the frame.
    panVec.y += panY.value * halfH;
    panVec.x += followX.value;
    camera.position.add(panVec);
    camera.lookAt(panVec);

    key.position.copy(camera.position).multiplyScalar(0.7);
    key.position.y += 5;
    rim.position.copy(camera.position).multiplyScalar(-0.6);

    /* Hover raycast, only while the section allows it. */
    if (interactive) {
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(parts, true);
      let next = null;
      if (hits.length) {
        let o = hits[0].object;
        while (o && !parts.includes(o)) o = o.parent;
        next = o || null;
      }
      if (next !== hovered) {
        hovered = next;
        document.body.classList.toggle('is-part', !!hovered);
      }
    } else if (hovered) {
      hovered = null;
      document.body.classList.remove('is-part');
    }

    /* The called-out part floats toward the camera. */
    parts.forEach((p) => {
      const l = p.userData.hi.value;
      if (l < 0.001) { p.position.y = 0; p.position.z = 0; return; }
      // Perpendicular to the engine axis only. Lifting it along X as well would
      // shove the part out of its slot on the exploded grid and into its
      // neighbour.
      tmp.copy(camera.position);
      tmp.x = 0;
      tmp.normalize().multiplyScalar(l * 0.5);
      p.position.y = tmp.y;
      p.position.z = tmp.z;
    });

    // The hotspot labels whatever is currently called out. Hover wins over the
    // scroll walk, since that is the visitor acting deliberately.
    const marked = hovered || focused;
    if (marked) {
      if (hotText.textContent !== marked.userData.name) {
        hotText.textContent = marked.userData.name;
      }
      anchorOf(marked, tmp);
      tmp.project(camera);
      const sx = (tmp.x * 0.5 + 0.5) * innerWidth;
      hotspot.style.transform =
        `translate3d(${sx}px, ${(-tmp.y * 0.5 + 0.5) * innerHeight}px, 0)`;
      // Flip the label to the left of its dot near the right edge. Without this
      // a long name like "Voice coil magnet" simply runs off the screen, which
      // on a phone is most of the time.
      hotspot.classList.toggle('is-flip', sx > innerWidth - HOT_LABEL_W);
      hotspot.classList.toggle('is-hover', marked === hovered);
      hotspot.classList.add('is-on');
    } else {
      hotspot.classList.remove('is-on');
    }

    renderer.render(scene, camera);
  });

  // Dev-only inspection hook, for tuning the scene and reading the real draw
  // call and triangle counts. Stripped from production by the DEV guard.
  if (import.meta.env.DEV) {
    window.__drive = {
      get calls() { return renderer.info.render.calls; },
      get tris() { return renderer.info.render.triangles; },
      renderer, scene, camera, parts,
    };
  }

  return {
    parts,
    /** 0 = assembled, 1 = fully open. */
    setExplode(v) { explode.target = still ? 0 : clamp(v, 0, 1); },
    setOrbit(y, p) { yaw.target = y; pitch.target = p; },
    /** t: 0 frames the closed drive, 1 frames the full exploded stack. */
    setFraming(t) {
      framed = distAssembled + (distExploded - distAssembled) * clamp(t, 0, 1);
      // A focused part owns the camera distance. Without this guard the section
      // rewrites the target every frame and the zoom onto a named part is
      // undone before the spring can travel a pixel.
      if (!focused) camDist.target = framed;
    },
    /** Screen-space composition, in half-frames. -1 is a full frame left. */
    setPan(x, y) { panX.target = x; panY.target = y; },
    setInteractive(v) { interactive = v && !still; },
    /**
     * Call out one part, or null for none.
     *
     * Focusing also takes over the camera distance, and frames the part on its
     * own size rather than on a fixed zoom. The row runs from a 6.5 long cowl
     * to a 0.5 turbine: one distance that suits both does not exist, and the
     * whole row held in frame leaves the small parts a few dozen pixels across.
     * Showing roughly the named part plus its neighbours is what a teardown
     * actually does.
     */
    setFocus(p) {
      focused = p || null;
      focusMode.target = focused ? 1 : 0;
      // Framed on the PART's own extents, not the engine's. Using the whole
      // engine's height meant the 5.4 nacelle diameter dominated every
      // calculation and the camera never actually moved in: a 1.5 tall
      // compressor was framed as though it were as tall as the cowl.
      camDist.target = focused
        ? distFor(
          clamp(focused.userData.width * 3.2, 3.4, explodedWidth),
          clamp(focused.userData.height * 2.0, 2.6, size.y),
          0.74,
        )
        : framed;
    },
    /** Used by the intro so the drive assembles itself on first paint. */
    prime() { explode.jump(1); camDist.jump(distExploded * 1.8); },

    /*
     * React's StrictMode mounts every effect twice in development. Without a
     * real teardown that means two WebGL contexts, two frame tasks and two
     * hotspots, and the second context silently loses the first.
     */
    dispose() {
      stop();
      disposers.forEach((fn) => fn());
      hotspot.remove();
      document.body.classList.remove('is-part');
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const m = o.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else if (m) m.dispose();
      });
      envRT.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
