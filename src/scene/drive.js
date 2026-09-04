/*
 * A 3.5-inch hard disk drive, built from primitives rather than loaded.
 *
 * Two reasons it is procedural and not a glTF:
 *   1. Every vertex here is ours. No product photography, no vendor CAD, no
 *      trademark on the part.
 *   2. Nothing to download. No Draco decoder, no texture set, no CORS. The
 *      whole drive is generated at runtime from a few hundred lines of maths.
 *
 * Part selection follows one rule: the major components someone would actually
 * recognise, never the detailed internals. Seven parts, each nameable. A
 * forty-part teardown is less legible, not more impressive.
 *
 * The drive is laid out flat in XZ with thickness running up Y, because that is
 * genuinely how one is stacked: board, casting, motor, magnet, heads, platters,
 * cover. Exploding along Y is therefore anatomically true rather than a
 * decorative scatter, which is what keeps it reading as engineering.
 *
 * Scale: 1 world unit is about 25 mm, so the drive measures 5.84 x 4.06.
 */

import * as THREE from 'three';
import { rbox, taperedArm, sector, ribbon, mulberry } from './shapes.js';
import { driveMaterials } from './materials.js';
import { PART } from '../data/parts.js';

const L = 5.84; // length  (X)
const W = 4.06; // width   (Z)

const SPINDLE_X = -0.55; // the platter stack sits left of centre
const SPINDLE_Z = 0;
const PLATTER_R = 1.9;
const PLATTER_GAP = 0.14;

const PIVOT_X = 1.95; // actuator pivot, back right, the way every drive does it
const PIVOT_Z = -1.25;
const ARM_LEN = 2.05;

/**
 * Rotation that aims the arm's local +X at the platter centre.
 *
 * An object rotated by `rotation.y = f` maps its local +X to world
 * (cos f, 0, -sin f), which is the sign convention that matters here: getting
 * it backwards swings the arm out over the casting wall instead of over the
 * disc, and the mistake is invisible until the heads are somewhere absurd.
 */
export const ARM_AIM = -Math.atan2(SPINDLE_Z - PIVOT_Z, SPINDLE_X - PIVOT_X);

// Sweep limits, measured rather than guessed: at AIM + 0.15 the head sits about
// 0.83 from the spindle and at AIM + 0.72 it is at 1.85, just inside the rim.
// That is a real data band. Park is further out again, clear of the disc.
export const ARM_INNER = ARM_AIM + 0.15;
export const ARM_OUTER = ARM_AIM + 0.72;

/*
 * Where the arm sits once the drive is open.
 *
 * NOT the park position, which is what this was first. Parked, the arm swings
 * out past the platter edge and ends up almost end-on to the camera, where four
 * stacked blades collapse into a single chevron and read as debris rather than
 * as an arm. Held out over the disc instead, its taper is broadside to the
 * viewer and the part is legible, which is the whole point of an exploded view.
 */
export const ARM_REST = ARM_AIM + 0.4;

/** A part is a Group carrying its own metadata for the explode and highlight. */
function part(record, M) {
  const g = new THREE.Group();
  g.name = record.name;
  g.userData = {
    name: record.name, spec: record.spec, order: record.order,
    home: new THREE.Vector3(),
    // Base values recorded up front, so the highlight can dim and restore
    // without having to guess at the authored numbers.
    mats: Object.values(M).map((m) => ({
      mat: m,
      env: m.envMapIntensity ?? 1,
      col: m.color.clone(),
    })),
  };
  return g;
}

export function buildDrive() {
  const drive = new THREE.Group();
  const parts = [];
  let platterSpin = null;
  let hubSpin = null;
  let armPivot = null;

  const add = (g, y) => {
    g.position.y = y;
    g.userData.home.copy(g.position);
    drive.add(g);
    parts.push(g);
    return g;
  };

  /* 1. Controller PCB ---------------------------------------------------- */
  {
    const M = driveMaterials();
    const g = part(PART.board, M);
    g.add(new THREE.Mesh(rbox(L - 0.5, 0.07, W - 0.7, 0.02), M.board));

    // Components sit on the UP face here. On a real drive they face down into
    // the casting, and modelling it that way is what the first pass did: the
    // teardown's last beat then landed on a blank grey slab, because every
    // interesting thing on the part was pointing away from the camera. A bench
    // teardown flips the board over to look at it, so this is what you would
    // actually be looking at, just without the flip.
    //
    // Surface-mount clutter, deliberately irregular. A perfect grid of
    // identical blocks is the tell that reads as generated. Instanced: as
    // separate meshes this detail alone would be a third of the draw calls.
    const rng = mulberry(4471);
    const CLUTTER = 34;
    const clutter = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.chip, CLUTTER);
    const cm = new THREE.Matrix4();
    for (let i = 0; i < CLUTTER; i++) {
      const w = 0.07 + rng() * 0.2;
      const h = 0.02 + rng() * 0.05;
      const d = 0.06 + rng() * 0.16;
      cm.compose(
        new THREE.Vector3((rng() - 0.5) * (L - 1.3), 0.035 + h / 2, (rng() - 0.5) * (W - 1.2)),
        new THREE.Quaternion(),
        new THREE.Vector3(w, h, d),
      );
      clutter.setMatrixAt(i, cm);
    }
    clutter.instanceMatrix.needsUpdate = true;
    g.add(clutter);

    // The two big packages: controller and cache. Named parts of the silhouette
    // rather than more clutter, so they are modelled at their real relative size.
    const soc = new THREE.Mesh(rbox(0.86, 0.06, 0.86, 0.01), M.chip);
    soc.position.set(-0.7, 0.065, 0.3);
    g.add(soc);
    const dram = new THREE.Mesh(rbox(0.54, 0.05, 0.34, 0.01), M.chip);
    dram.position.set(0.5, 0.06, -0.5);
    g.add(dram);

    // SATA data and power, on the back edge. These two shapes are most of what
    // makes a bare board read as a hard drive rather than as any other PCB.
    const sata = new THREE.Mesh(rbox(0.42, 0.14, 0.2, 0.012), M.plastic);
    sata.position.set(0.55, 0.105, W / 2 - 0.42);
    g.add(sata);
    const power = new THREE.Mesh(rbox(0.72, 0.14, 0.2, 0.012), M.plastic);
    power.position.set(1.35, 0.105, W / 2 - 0.42);
    g.add(power);

    // Motor and head contact pads, where the board meets the casting.
    const pads = new THREE.InstancedMesh(rbox(0.22, 0.012, 0.1, 0.004), M.brass, 8);
    const pm = new THREE.Matrix4();
    for (let i = 0; i < 8; i++) {
      pm.makeTranslation(-1.0 + (i % 4) * 0.28, -0.04, i < 4 ? -0.9 : -1.16);
      pads.setMatrixAt(i, pm);
    }
    pads.instanceMatrix.needsUpdate = true;
    g.add(pads);
    add(g, -0.42);
  }

  /* 2. Base casting ------------------------------------------------------ */
  {
    const M = driveMaterials();
    const g = part(PART.base, M);
    g.add(new THREE.Mesh(rbox(L, 0.12, W, 0.05), M.cast));

    // Four walls rather than a hollowed solid. A tub built from walls has real
    // inner faces for the key light to fall on, which is what gives the open
    // drive its depth; a solid block with a subtracted pocket has none.
    const wallX = rbox(L, 0.54, 0.22, 0.04);
    const wallZ = rbox(0.22, 0.54, W - 0.44, 0.04);
    [[0, 0.33, W / 2 - 0.11, wallX], [0, 0.33, -W / 2 + 0.11, wallX],
     [L / 2 - 0.11, 0.33, 0, wallZ], [-L / 2 + 0.11, 0.33, 0, wallZ]]
      .forEach(([x, y, z, geo]) => {
        const m = new THREE.Mesh(geo, M.cast);
        m.position.set(x, y, z);
        g.add(m);
      });

    // Machined bosses at the corners, in the brighter alloy. Real castings are
    // dull everywhere except where a cutter has been.
    const bosses = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16), M.machined, 6,
    );
    const bm = new THREE.Matrix4();
    [[-L / 2 + 0.4, W / 2 - 0.4], [-L / 2 + 0.4, -W / 2 + 0.4],
     [0, W / 2 - 0.4], [0, -W / 2 + 0.4],
     [L / 2 - 0.4, W / 2 - 0.4], [L / 2 - 0.4, -W / 2 + 0.4]]
      .forEach(([x, z], i) => {
        bm.makeTranslation(x, 0.62, z);
        bosses.setMatrixAt(i, bm);
      });
    bosses.instanceMatrix.needsUpdate = true;
    g.add(bosses);

    // The pocket the motor drops into.
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.06, 28), M.machined);
    seat.position.set(SPINDLE_X, 0.09, SPINDLE_Z);
    g.add(seat);
    add(g, -0.16);
  }

  /* 3. Spindle motor ----------------------------------------------------- */
  {
    const M = driveMaterials();
    const g = part(PART.spindle, M);
    const stator = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.14, 30), M.machined);
    stator.position.set(SPINDLE_X, -0.12, SPINDLE_Z);
    g.add(stator);

    // The hub the platters clamp onto. Spun by the stage, together with the
    // stack above it, so the two never disagree about which way round is up.
    hubSpin = new THREE.Group();
    hubSpin.position.set(SPINDLE_X, 0, SPINDLE_Z);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.44, 30), M.machined);
    hub.position.y = 0.12;
    hubSpin.add(hub);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.05, 30), M.plate);
    collar.position.y = -0.08;
    hubSpin.add(collar);
    g.add(hubSpin);
    add(g, 0.18);
  }

  /* 4. Voice coil magnet ------------------------------------------------- */
  {
    const M = driveMaterials();
    const g = part(PART.magnet, M);
    // Placed and rotated at the pivot, so it sits under the coil's whole travel
    // no matter where the arm happens to be parked.
    const yoke = new THREE.Group();
    yoke.position.set(PIVOT_X, 0, PIVOT_Z);
    yoke.rotation.y = ARM_AIM + 0.45;

    const back = new THREE.Mesh(sector(0.28, 1.0, 0.78, 0.06), M.plate);
    back.position.y = -0.03;
    yoke.add(back);
    const mag = new THREE.Mesh(sector(0.36, 0.92, 0.66, 0.07), M.magnet);
    mag.position.y = 0.035;
    yoke.add(mag);
    g.add(yoke);

    // The pivot bearing's outer race, which is fixed to the casting rather than
    // to the arm, so it belongs on this part and not on the head stack.
    const race = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 20), M.machined);
    race.position.set(PIVOT_X, 0.24, PIVOT_Z);
    g.add(race);
    add(g, 0.02);
  }

  /* 5. Head stack -------------------------------------------------------- */
  {
    const M = driveMaterials();
    const g = part(PART.heads, M);

    armPivot = new THREE.Group();
    armPivot.position.set(PIVOT_X, 0, PIVOT_Z);
    armPivot.rotation.y = ARM_REST;

    // Four arms, so the two inner ones sit between platters and carry a slider
    // on each face. That is why three discs need four arms and not three.
    const ARMS = 4;
    const arms = new THREE.InstancedMesh(taperedArm(ARM_LEN), M.machined, ARMS);
    const am = new THREE.Matrix4();
    const LEVELS = [-0.21, -0.07, 0.07, 0.21];
    LEVELS.forEach((y, i) => {
      am.makeTranslation(0, y, 0);
      arms.setMatrixAt(i, am);
    });
    arms.instanceMatrix.needsUpdate = true;
    armPivot.add(arms);

    // Sliders. Tiny, but their absence is quietly noticeable: an arm that ends
    // in nothing reads as broken rather than as an arm.
    const sliders = new THREE.InstancedMesh(rbox(0.11, 0.022, 0.09, 0.004), M.plate, 6);
    const sm = new THREE.Matrix4();
    [-0.185, -0.155, -0.045, 0.095, 0.185, 0.235].forEach((y, i) => {
      sm.makeTranslation(ARM_LEN - 0.04, y, 0);
      sliders.setMatrixAt(i, sm);
    });
    sliders.instanceMatrix.needsUpdate = true;
    armPivot.add(sliders);

    const coil = new THREE.Mesh(sector(0.34, 0.86, 0.5, 0.09), M.copper);
    coil.position.y = 0.1;
    armPivot.add(coil);

    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.62, 18), M.machined);
    armPivot.add(boss);
    g.add(armPivot);

    // The flex circuit stays put while the arm sweeps. It anchors to the
    // casting wall, which is exactly where it disconnects on a real bench.
    g.add(new THREE.Mesh(ribbon([
      new THREE.Vector3(PIVOT_X - 0.28, 0.0, PIVOT_Z - 0.06),
      new THREE.Vector3(PIVOT_X + 0.1, 0.06, PIVOT_Z - 0.52),
      new THREE.Vector3(PIVOT_X + 0.62, 0.04, PIVOT_Z - 0.76),
      new THREE.Vector3(L / 2 - 0.34, -0.02, PIVOT_Z - 0.66),
    ]), M.kapton));
    const preamp = new THREE.Mesh(rbox(0.24, 0.05, 0.18, 0.008), M.chip);
    preamp.position.set(PIVOT_X + 0.42, 0.06, PIVOT_Z - 0.7);
    g.add(preamp);
    add(g, 0.2);
  }

  /* 6. Platters ---------------------------------------------------------- */
  {
    const M = driveMaterials();
    const g = part(PART.platters, M);

    platterSpin = new THREE.Group();
    platterSpin.position.set(SPINDLE_X, 0, SPINDLE_Z);

    const discs = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(PLATTER_R, PLATTER_R, 0.05, 96, 1), M.platter, 3,
    );
    const dm = new THREE.Matrix4();
    [-PLATTER_GAP, 0, PLATTER_GAP].forEach((y, i) => {
      dm.makeTranslation(0, y, 0);
      discs.setMatrixAt(i, dm);
    });
    discs.instanceMatrix.needsUpdate = true;
    platterSpin.add(discs);

    const spacers = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.44, 0.44, 0.09, 28), M.plate, 2,
    );
    const pm = new THREE.Matrix4();
    [-PLATTER_GAP / 2, PLATTER_GAP / 2].forEach((y, i) => {
      pm.makeTranslation(0, y, 0);
      spacers.setMatrixAt(i, pm);
    });
    spacers.instanceMatrix.needsUpdate = true;
    platterSpin.add(spacers);

    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.045, 30), M.machined);
    clamp.position.y = PLATTER_GAP + 0.05;
    platterSpin.add(clamp);

    // Six clamp screws. They are the only feature on an otherwise mirror-smooth
    // stack, which makes them the only thing that shows the rotation at all:
    // a perfect disc spinning is indistinguishable from a disc standing still.
    const screws = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), M.plate, 6,
    );
    const km = new THREE.Matrix4();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      km.makeTranslation(Math.cos(a) * 0.28, PLATTER_GAP + 0.08, Math.sin(a) * 0.28);
      screws.setMatrixAt(i, km);
    }
    screws.instanceMatrix.needsUpdate = true;
    platterSpin.add(screws);
    g.add(platterSpin);
    add(g, 0.2);
  }

  /* 7. Top cover --------------------------------------------------------- */
  {
    const M = driveMaterials();
    const g = part(PART.cover, M);
    g.add(new THREE.Mesh(rbox(L, 0.06, W, 0.05), M.steel));
    // The stamped centre panel. A flat lid reads as a piece of card.
    const panel = new THREE.Mesh(rbox(L - 0.7, 0.05, W - 0.7, 0.04), M.steel);
    panel.position.y = 0.04;
    g.add(panel);

    const screws = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.03, 14), M.plate, 6,
    );
    const cm = new THREE.Matrix4();
    [[-L / 2 + 0.4, W / 2 - 0.4], [-L / 2 + 0.4, -W / 2 + 0.4],
     [0, W / 2 - 0.4], [0, -W / 2 + 0.4],
     [L / 2 - 0.4, W / 2 - 0.4], [L / 2 - 0.4, -W / 2 + 0.4]]
      .forEach(([x, z], i) => {
        cm.makeTranslation(x, -0.02, z);
        screws.setMatrixAt(i, cm);
      });
    screws.instanceMatrix.needsUpdate = true;
    g.add(screws);

    const breather = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), M.plate);
    breather.position.set(L / 2 - 0.85, 0.07, -W / 2 + 0.62);
    g.add(breather);
    add(g, 0.56);
  }

  /*
   * Anchor point for each part's label and for the camera's vertical tracking.
   *
   * The group ORIGIN is not the part. The platters and the head stack are both
   * modelled out at their own axis, so anchoring at the origin would float
   * "PLATTERS" over empty casting. The bounding-box centre is the honest
   * anchor, and since it is fixed in local space it is measured once.
   */
  parts.forEach((g) => {
    const b = new THREE.Box3().setFromObject(g);
    g.userData.anchor = b.getCenter(new THREE.Vector3()).sub(g.position);
  });

  // Centre the whole assembly on its own bounds so rotation feels balanced.
  const box = new THREE.Box3().setFromObject(drive);
  drive.position.sub(box.getCenter(new THREE.Vector3()));

  return { drive, parts, platterSpin, hubSpin, armPivot };
}
