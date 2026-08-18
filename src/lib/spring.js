// Semi-implicit Euler spring, the integrator behind every piece of motion on
// the site.
//
// This replaced `value += (target - value) * ease` in usePointer, useMagnetic
// and the smooth scroller. Exponential smoothing has two problems that no
// amount of tuning fixes:
//
//   1. It cannot overshoot. It only ever approaches, so nothing lands with any
//      weight. The settle past the mark is most of what reads as expensive.
//   2. It is framerate dependent. An ease of 0.14 travels twice as far per
//      second on a 120Hz display as on a 60Hz one, so the site genuinely feels
//      different machine to machine.
//
// A spring carries velocity between frames and integrates against real elapsed
// time, which fixes both.
//
// Damping ratio = damping / (2 * sqrt(stiffness * mass)).
//   < 1  underdamped, overshoots and settles. Use for pointer-led motion.
//   ~ 1  critically damped, fastest approach with no overshoot. Use for scroll,
//        where overshoot is nauseating rather than characterful.
//   > 1  overdamped, sluggish.

export function createSpring({ stiffness = 170, damping = 22, mass = 1, value = 0 } = {}) {
  let v = value;
  let vel = 0;
  let target = value;

  return {
    set stiffness(n) {
      stiffness = n;
    },
    set damping(n) {
      damping = n;
    },
    set target(t) {
      target = t;
    },
    get target() {
      return target;
    },
    get value() {
      return v;
    },
    get velocity() {
      return vel;
    },
    jump(t) {
      v = t;
      target = t;
      vel = 0;
    },
    step(dt) {
      // A backgrounded tab hands back a dt of several seconds on return.
      // Integrating that in one go throws the spring to infinity.
      const h = Math.min(dt, 1 / 30);
      const force = -stiffness * (v - target);
      const drag = -damping * vel;
      vel += ((force + drag) / mass) * h;
      v += vel * h;
      return v;
    },
    settled(eps = 0.01) {
      return Math.abs(v - target) < eps && Math.abs(vel) < eps;
    },
  };
}

/** Clock that yields seconds since the last call, clamped and dt-safe. */
export function createClock() {
  let last = 0;
  return (now) => {
    if (!last) {
      last = now;
      return 1 / 60;
    }
    const dt = (now - last) / 1000;
    last = now;
    return dt > 0 ? dt : 1 / 60;
  };
}
