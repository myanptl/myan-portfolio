/*
 * A high-bypass turbofan, built from primitives rather than loaded.
 *
 * Two reasons it is procedural and not a glTF:
 *   1. Every vertex here is ours. No product photography, no vendor CAD, no
 *      trademark on the part.
 *   2. Nothing to download. No Draco decoder, no texture set, no CORS. The
 *      whole engine is generated at runtime from a few hundred lines of maths.
 *
 * Part selection follows one rule: the major components someone would actually
 * recognise, never the detailed internals. Eleven parts, each nameable.
 *
 * The engine lies along X with the inlet at -X, and it comes apart along that
 * same axis, because that is genuinely how one is assembled and split: modules
 * threaded onto two concentric shafts. Exploding along the axis is therefore
 * anatomically true rather than a decorative scatter.
 *
 * Scale: 1 world unit is about 0.63 m, so the fan measures 2.8 m across.
 */

import * as THREE from 'three';
import { bladeGeometry, lathe, rbox } from './shapes.js';
import { engineMaterials } from './materials.js';
import { PART } from '../data/parts.js';

const FAN_HUB = 0.52;
const FAN_TIP = 2.2;

/** A part is a Group carrying its own metadata for the explode and highlight. */
function part(record, M) {
  const g = new THREE.Group();
  g.name = record.name;
  g.userData = {
    name: record.name, spec: record.spec, order: record.order,
    step: record.step, spin: record.spin,
    home: new THREE.Vector3(),
    // Base values recorded up front, so the highlight can dim and restore
    // without having to guess at the authored numbers.
    mats: Object.values(M).map((m) => ({
      mat: m, env: m.envMapIntensity ?? 1, col: m.color.clone(),
    })),
  };
  return g;
}

/**
 * One blade row as a single InstancedMesh.
 *
 * `stages` lets a whole multi-stage spool share one draw call: the blade is
 * modelled once and each instance carries its own axial position, angle about
 * the engine axis, hub radius and span scale.
 *
 * The hub is applied HERE rather than in the geometry, by pushing each blade
 * out along its own radius after it has been rotated into place. That is what
 * lets a compressor drum swell toward the back while its blades get shorter.
 */
function bladeRow(geo, mat, stages) {
  const total = stages.reduce((n, s) => n + s.count, 0);
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const scl = new THREE.Vector3();
  let i = 0;
  for (const s of stages) {
    for (let b = 0; b < s.count; b++) {
      // A fractional offset per stage so successive rows never line up, which
      // is also why real stages are clocked against each other.
      const a = ((b + s.clock * 0.37) / s.count) * Math.PI * 2;
      pos.set(s.x, Math.cos(a) * s.hub, Math.sin(a) * s.hub);
      e.set(a, 0, 0);
      q.setFromEuler(e);
      scl.set(s.scale ?? 1, s.scale ?? 1, s.scale ?? 1);
      m.compose(pos, q, scl);
      mesh.setMatrixAt(i++, m);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/** Discs, rings and spacers, also instanced. */
function discRow(geo, mat, at) {
  const mesh = new THREE.InstancedMesh(geo, mat, at.length);
  const m = new THREE.Matrix4();
  at.forEach(([x, s], i) => {
    m.compose(new THREE.Vector3(x, 0, 0), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    mesh.setMatrixAt(i, m);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/** A disc lying in the YZ plane, so it reads as a rotor face, not a pipe. */
const disc = (r, len, seg = 40) => {
  const g = new THREE.CylinderGeometry(r, r, len, seg);
  g.rotateZ(Math.PI / 2);
  return g;
};

export function buildEngine() {
  const engine = new THREE.Group();
  const parts = [];

  /*
   * Seats each part on its own geometry.
   *
   * Every mesh below is authored in ABSOLUTE engine coordinates, which is the
   * only way to lay out an assembly without tracking a separate origin per
   * module in your head. This then measures where the part actually sits,
   * shifts its children back to a local origin, and records that as its home.
   * Without it, rotating a part about the engine axis would swing it around
   * the nose instead of spinning it in place.
   */
  const seat = (g) => {
    g.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(g);
    const cx = box.getCenter(new THREE.Vector3()).x;
    g.children.forEach((c) => { c.position.x -= cx; });
    g.position.x = cx;
    g.userData.home.copy(g.position);
    engine.add(g);
    parts.push(g);
    return g;
  };

  /* 1. Nacelle ------------------------------------------------------------ */
  {
    const M = engineMaterials();
    const g = part(PART.nacelle, M);
    // A closed profile, so the cowl is revolved with real wall thickness. An
    // open one gives a paper tube that vanishes when seen from inside.
    // Longer and slimmer than the first pass, which bulged to 2.72 over a 6.5
    // length and read as a donut. A real high bypass nacelle is roughly as long
    // as it is wide, and its widest point sits just behind the inlet lip.
    g.add(new THREE.Mesh(lathe([
      [2.40, -3.45], [2.52, -3.22], [2.56, -2.85], [2.55, -1.80],
      [2.52, -0.60], [2.44, 0.80], [2.24, 2.10], [2.00, 3.05],
      [1.94, 3.05], [2.10, 2.10], [2.24, 0.80], [2.30, -0.60],
      [2.31, -1.80], [2.32, -2.85], [2.30, -3.15], [2.40, -3.45],
    ], 56), M.cowl));
    // The inlet throat, darker so the fan stays the brightest thing seen
    // through the opening.
    g.add(new THREE.Mesh(lathe([
      [2.30, -3.15], [2.28, -2.70], [2.29, -2.20],
    ], 56), M.duct));
    seat(g);
  }

  /* 2. Spinner ------------------------------------------------------------ */
  {
    const M = engineMaterials();
    const g = part(PART.spinner, M);
    g.add(new THREE.Mesh(lathe([
      [0.015, -3.66], [0.12, -3.58], [0.26, -3.44], [0.38, -3.28],
      [0.47, -3.12], [0.52, -3.00], [0.0, -3.00],
    ], 48), M.alloy));

    // The painted spiral. One thin stripe wound onto the cone: it is the
    // detail that makes a spinner read as a spinner, and on a real engine it
    // is there so anyone walking past can see the thing is turning.
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const a = t * Math.PI * 3.1;
      const r = 0.06 + t * 0.44;
      pts.push(new THREE.Vector3(-3.62 + t * 0.6, Math.cos(a) * r, Math.sin(a) * r));
    }
    g.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.022, 6, false),
      M.seal,
    ));
    seat(g);
  }

  /* 3. Fan ---------------------------------------------------------------- */
  {
    const M = engineMaterials();
    const g = part(PART.fan, M);

    // Only the plain meshes are positioned here. A bladeRow already carries its
    // axial position inside the instance matrices, so moving the mesh as well
    // puts the blades at twice the offset and leaves them behind the spinner.
    const hub = new THREE.Mesh(disc(FAN_HUB, 0.36), M.alloy);
    hub.position.x = -3.0;
    const platform = new THREE.Mesh(disc(FAN_HUB + 0.06, 0.2), M.caseAlloy);
    platform.position.x = -3.0;
    g.add(hub, platform);

    // Twenty blades. A wide chord, heavily twisted, raked back at the tip.
    g.add(bladeRow(
      bladeGeometry({
        chord: 0.95, span: FAN_TIP - FAN_HUB, thick: 0.075,
        twist: 1.2, sweep: 0.4, seg: 12, chordSeg: 5,
      }),
      M.blade,
      [{ x: -3.0, count: 20, clock: 0, hub: FAN_HUB }],
    ));
    seat(g);
  }

  /* 4. Fan case and outlet guide vanes ------------------------------------ */
  {
    const M = engineMaterials();
    const g = part(PART.fancase, M);
    g.add(new THREE.Mesh(lathe([
      [2.26, -2.78], [2.44, -2.78], [2.44, -2.10], [2.26, -2.10], [2.26, -2.78],
    ], 56), M.caseAlloy));
    // Thirty-four vanes, straightening the bypass swirl. Barely twisted: their
    // job is to take the spin out, not to add any.
    g.add(bladeRow(
      bladeGeometry({ chord: 0.4, span: 1.5, thick: 0.04, twist: 0.42, sweep: 0.05 }),
      M.alloy,
      [{ x: -2.44, count: 26, clock: 0, hub: 0.76 }],
    ));
    g.add(new THREE.Mesh(disc(0.74, 0.5), M.caseAlloy));
    g.children[g.children.length - 1].position.x = -2.44;
    seat(g);
  }

  /* 5. Booster ------------------------------------------------------------ */
  {
    const M = engineMaterials();
    const g = part(PART.booster, M);
    const stages = [0, 1, 2].map((i) => ({ x: -1.98 + i * 0.25, count: 30, clock: i, hub: 0.44, scale: 1 - i * 0.08 }));
    g.add(bladeRow(
      bladeGeometry({ chord: 0.22, span: 0.44, thick: 0.028, twist: 0.7, sweep: 0.08 }),
      M.blade, stages,
    ));
    g.add(discRow(disc(0.44, 0.14, 32), M.alloy, stages.map((s) => [s.x, 1])));
    g.add(new THREE.Mesh(lathe([[0.42, -2.12], [0.44, -1.4]], 40), M.alloy));
    seat(g);
  }

  /* 6. High pressure compressor ------------------------------------------- */
  {
    const M = engineMaterials();
    const g = part(PART.hpc, M);
    // Eight stages, each smaller than the last. The air is being squeezed into
    // a smaller and smaller annulus, which is the whole idea.
    const stages = Array.from({ length: 8 }, (_, i) => ({
      x: -1.24 + i * 0.15, count: 34, clock: i, hub: 0.36 + i * 0.015, scale: 1 - i * 0.075,
    }));
    g.add(bladeRow(
      bladeGeometry({ chord: 0.17, span: 0.42, thick: 0.022, twist: 0.62, sweep: 0.05 }),
      M.blade, stages,
    ));
    // The drum they are all mounted on, tapering with them.
    g.add(new THREE.Mesh(lathe([[0.34, -1.32], [0.4, -0.66], [0.45, -0.02]], 40), M.alloy));
    seat(g);
  }

  /* 7. Combustor ---------------------------------------------------------- */
  {
    const M = engineMaterials();
    const g = part(PART.combustor, M);
    // An annular can: outer and inner liner walls joined by a domed head.
    g.add(new THREE.Mesh(lathe([
      [0.52, 0.08], [0.48, 0.24], [0.47, 0.62], [0.5, 0.8],
      [0.92, 0.8], [0.95, 0.55], [0.93, 0.24], [0.78, 0.06],
      [0.66, 0.02], [0.52, 0.08],
    ], 56), M.liner));
    // Twenty fuel nozzles around the head.
    const nozzle = new THREE.InstancedMesh(disc(0.05, 0.2, 10), M.alloy, 20);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      m.makeTranslation(0.0, Math.cos(a) * 0.72, Math.sin(a) * 0.72);
      nozzle.setMatrixAt(i, m);
    }
    nozzle.instanceMatrix.needsUpdate = true;
    g.add(nozzle);
    seat(g);
  }

  /* 8. High pressure turbine ---------------------------------------------- */
  {
    const M = engineMaterials();
    const g = part(PART.hpt, M);
    const stages = [0, 1].map((i) => ({ x: 0.94 + i * 0.24, count: 38, clock: i, hub: 0.42, scale: 1 + i * 0.12 }));
    g.add(bladeRow(
      bladeGeometry({ chord: 0.26, span: 0.44, thick: 0.05, twist: 0.95, sweep: 0.1 }),
      M.hotBlade, stages,
    ));
    g.add(discRow(disc(0.42, 0.16, 32), M.stained, stages.map((s) => [s.x, 1])));
    seat(g);
  }

  /* 9. Low pressure turbine ------------------------------------------------ */
  {
    const M = engineMaterials();
    const g = part(PART.lpt, M);
    // Growing rather than shrinking: the gas is expanding through it.
    const stages = Array.from({ length: 4 }, (_, i) => ({
      x: 1.48 + i * 0.22, count: 44, clock: i, hub: 0.46 + i * 0.02, scale: 1 + i * 0.16,
    }));
    g.add(bladeRow(
      bladeGeometry({ chord: 0.24, span: 0.5, thick: 0.038, twist: 0.85, sweep: 0.08 }),
      M.hotBlade, stages,
    ));
    g.add(discRow(disc(0.46, 0.14, 32), M.alloy, stages.map((s, i) => [s.x, 1 + i * 0.1])));
    seat(g);
  }

  /* 10. Exhaust plug ------------------------------------------------------- */
  {
    const M = engineMaterials();
    const g = part(PART.plug, M);
    g.add(new THREE.Mesh(lathe([
      [0.0, 2.28], [0.62, 2.28], [0.58, 2.5], [0.44, 2.78],
      [0.24, 3.0], [0.04, 3.12],
    ], 48), M.stained));
    seat(g);
  }

  /* 11. Shafts -------------------------------------------------------------- */
  {
    const M = engineMaterials();
    const g = part(PART.shafts, M);
    // The low shaft runs the length of the engine, inside the high shaft, which
    // only has to reach from the compressor to its own turbine. Modelled at a
    // readable length rather than the full span, so the pair reads as
    // concentric instead of as one long rod.
    const lp = new THREE.Group();
    lp.add(new THREE.Mesh(disc(0.15, 2.9, 28), M.shaft));
    lp.add(new THREE.Mesh(disc(0.2, 0.22, 28), M.alloy));
    lp.children[1].position.x = 1.3;
    g.add(lp);

    const hp = new THREE.Group();
    // Hollow, because the low shaft passes through it. A solid outer shaft
    // would be a lie you can see the moment the two are pulled apart.
    hp.add(new THREE.Mesh(lathe([
      [0.24, -0.75], [0.24, 0.8], [0.3, 0.8], [0.3, -0.75], [0.24, -0.75],
    ], 32), M.shaft));
    g.add(hp);

    // Bearings, where the two are actually carried.
    g.add(discRow(disc(0.34, 0.12, 24), M.caseAlloy, [[-1.4, 1], [1.35, 1]]));
    g.userData.spools = { lp, hp };
    seat(g);
  }

  /*
   * Centre the assembly by moving the PARTS, not the engine group.
   *
   * The exploded target is `order * SPREAD` measured in the engine's own local
   * space, and that grid is centred on zero. If the assembled parts are centred
   * anywhere else, the whole object slides sideways as it opens and back again
   * as it closes, which reads as the camera drifting rather than as the engine
   * coming apart.
   */
  engine.updateMatrixWorld(true);
  const centre = new THREE.Box3().setFromObject(engine).getCenter(new THREE.Vector3());
  parts.forEach((g) => {
    g.position.x -= centre.x;
    g.userData.home.x -= centre.x;
  });

  // Anchors are measured last, once every part is where it belongs. The group
  // ORIGIN is not the part: the shafts and the nacelle both span far more than
  // their own centre, so the bounding-box centre is the honest place to pin a
  // label. Fixed in local space, so it is measured once.
  engine.updateMatrixWorld(true);
  parts.forEach((g) => {
    const b = new THREE.Box3().setFromObject(g);
    g.userData.anchor = b.getCenter(new THREE.Vector3()).sub(g.position);
  });

  /*
   * The exploded layout, packed by each part's real size rather than laid on an
   * even pitch.
   *
   * An even pitch is right for a laminated stack, where every layer is about as
   * thick as its neighbours. It is wrong here: the nacelle is 6.5 long and the
   * high pressure turbine is 0.5, so a fixed spacing either buries ten parts
   * inside the cowl or scatters the small ones half a screen apart. Packing to
   * a constant GAP between bounding boxes gives every part the room it actually
   * needs and none that it does not.
   */
  const GAP = 0.6;
  const byAxis = parts.slice().sort((a, b) => a.userData.order - b.userData.order);
  let cursor = 0;
  byAxis.forEach((g) => {
    const b = new THREE.Box3().setFromObject(g);
    const w = b.max.x - b.min.x;
    g.userData.width = w;
    g.userData.height = b.max.y - b.min.y;
    // Place the part's own bounding-box centre, then back out its anchor, since
    // the group origin is not the middle of the geometry for every part.
    g.userData.exploded = cursor + w / 2 - g.userData.anchor.x;
    cursor += w + GAP;
  });
  const explodedWidth = cursor - GAP;
  byAxis.forEach((g) => { g.userData.exploded -= explodedWidth / 2; });

  const size = new THREE.Box3().setFromObject(engine).getSize(new THREE.Vector3());
  return { engine, parts, size, explodedWidth };
}
