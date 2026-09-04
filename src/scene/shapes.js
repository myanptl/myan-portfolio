/*
 * Primitive builders shared by the drive.
 *
 * Kept apart from the assembly so drive.js reads as anatomy (which part sits
 * on which) rather than as a pile of vertex maths.
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/**
 * Every hard edge on real hardware is broken by a chamfer or a radius, and a
 * perfectly sharp edge is the clearest tell that something was made of boxes.
 * A small radius also gives each edge a specular highlight to catch, which is
 * most of what makes the metal read as metal rather than as grey plastic.
 */
export const rbox = (w, h, d, r = 0.012, seg = 2) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.min(r, Math.min(w, h, d) / 2.05));

/**
 * A tapered actuator arm, from a pivot hub of radius `hub` out to a slider tip.
 *
 * Drawn in the shape plane pointing along +X and symmetric about the axis, then
 * laid flat. `rotateX(-PI/2)` maps shape-Y to world -Z, which would mirror an
 * asymmetric profile. Symmetry here means the flip is invisible and the arm
 * needs no correction afterwards.
 */
export function taperedArm(len, hub = 0.3, tip = 0.055, depth = 0.032) {
  const s = new THREE.Shape();
  s.moveTo(0, hub);
  // A real arm is not a straight wedge. The concave taper is what gives it the
  // spring-steel look instead of reading as a triangle.
  s.quadraticCurveTo(len * 0.45, hub * 0.4, len, tip);
  s.lineTo(len, -tip);
  s.quadraticCurveTo(len * 0.45, -hub * 0.4, 0, -hub);
  s.absarc(0, 0, hub, -Math.PI / 2, Math.PI / 2, true);

  const g = new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2,
    curveSegments: 18,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -depth / 2, 0);
  return g;
}

/**
 * An annular sector lying flat, centred on the -X direction. Used for both the
 * voice coil and the magnet it swings over.
 */
export function sector(r0, r1, half, depth) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r1, Math.PI - half, Math.PI + half, false);
  s.absarc(0, 0, r0, Math.PI + half, Math.PI - half, true);
  const g = new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2,
    curveSegments: 26,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -depth / 2, 0);
  return g;
}

/**
 * A flat ribbon swept along a curve, for the flex circuit.
 *
 * ExtrudeGeometry's `extrudePath` sweeps the shape as a CROSS SECTION, so the
 * shape built here is the cable's end-on profile, not its outline. Passing the
 * outline instead produces a solid slab following the path, which is the kind
 * of mistake that looks like a modelling error rather than a bug.
 */
export function ribbon(points, width = 0.26, thick = 0.012, steps = 44) {
  const x = width / 2;
  const y = thick / 2;
  const s = new THREE.Shape();
  s.moveTo(-x, -y);
  s.lineTo(x, -y);
  s.lineTo(x, y);
  s.lineTo(-x, y);
  s.closePath();

  const path = new THREE.CatmullRomCurve3(points);
  return new THREE.ExtrudeGeometry(s, { extrudePath: path, steps, bevelEnabled: false });
}

/**
 * A turbomachinery blade, built along the engine's radial axis.
 *
 * Span runs up +Y, chord along X (the engine axis), thickness in Z, so a whole
 * stage is just this instanced at N angles about X.
 *
 * Three deformations, and all three are what separate a blade from a fin:
 *   twist  the blade rotates about its own span, a lot at the root and little
 *          at the tip, because the oncoming air meets the root and the tip at
 *          completely different angles. This is what catches the light as a
 *          travelling band when the stage turns.
 *   sweep  the tip rakes backwards, quadratically. Straight blades read as a
 *          paddle wheel.
 *   camber the aerofoil section itself, so the blade has a suction side.
 *
 * A BOX, never a plane: a zero-thickness blade disappears edge on, and a stage
 * of them reads as scattered debris rather than as a disc.
 */
export function bladeGeometry({
  chord, span, thick = 0.03, twist = 0.8, sweep = 0.25, seg = 6, chordSeg = 3,
}) {
  // Segmentation is the whole triangle budget of this scene: one blade is
  // nothing, but a compressor is several hundred of them. Only the span needs
  // real subdivision, because that is the axis the twist runs along. The first
  // pass subdivided the chord six ways across a blade 0.17 long, which is finer
  // than the blade is wide and cost 260 000 triangles across the engine.
  const g = new THREE.BoxGeometry(chord, span, thick, chordSeg, seg, 1);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = (y + span / 2) / span; // 0 at root, 1 at tip

    // Camber, applied before the twist so it rotates with the section.
    const c = (1 - (x / (chord / 2)) ** 2) * chord * 0.1 * (1 - t * 0.45);

    // Twist about the span axis. Unwinds toward the tip.
    const a = twist * (1 - t) - twist * 0.35;
    const cs = Math.cos(a);
    const sn = Math.sin(a);
    const zc = z + c;
    pos.setX(i, x * cs - zc * sn + t * t * sweep);
    pos.setZ(i, x * sn + zc * cs);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  /*
   * The root sits at y = 0, NOT on a hub radius baked into the geometry.
   *
   * Baking the hub in means scaling a stage down shrinks its hub along with its
   * span, and in a real compressor those go opposite ways: the drum swells
   * toward the back while the blades get shorter, because the annulus is
   * narrowing. With the hub baked in, the later stages scaled their roots
   * inward and eight rows of blades disappeared inside their own drum. Each
   * instance now carries its own radial offset instead.
   */
  g.translate(0, span / 2, 0);
  return g;
}

/**
 * A surface of revolution about the engine axis, from a profile given as
 * [radius, axial] pairs.
 *
 * LatheGeometry revolves around Y, so the profile is fed in as (x=radius,
 * y=axial) and the result is rotated to put the axis on X. Closing the profile
 * back on itself gives a shell with real wall thickness, which is what makes a
 * cowl read as a cowl instead of as a paper tube.
 */
export function lathe(profile, segments = 64) {
  const pts = profile.map(([r, a]) => new THREE.Vector2(r, a));
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateZ(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/** Small deterministic PRNG, so procedural clutter is identical every load. */
export function mulberry(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
