/*
 * One shared frame loop, plus the small maths the scene leans on.
 *
 * Every subsystem registers here rather than opening its own rAF. Several
 * competing loops is how frame budgets get silently blown, and it makes the dt
 * each consumer sees inconsistent.
 */

const tasks = new Set();
let last = performance.now();
let running = false;

function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  for (const fn of tasks) {
    try {
      fn(dt, now);
    } catch (err) {
      console.error('[frame] task failed', err);
    }
  }
  if (tasks.size) requestAnimationFrame(frame);
  else running = false;
}

/** Registers a per-frame callback. Returns an unsubscribe. */
export function onFrame(fn) {
  tasks.add(fn);
  if (!running) {
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  return () => tasks.delete(fn);
}

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const lerp = (a, b, t) => a + (b - a) * t;

/** Maps n from [inMin,inMax] to [outMin,outMax], clamped at both ends. */
export function mapRange(n, inMin, inMax, outMin, outMax) {
  const t = clamp((n - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * t;
}

/** Smoothstep, for easing a 0..1 progress without importing a whole library. */
export const smoothstep = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
