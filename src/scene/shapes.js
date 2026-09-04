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
