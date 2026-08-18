// Shared primitives for every demo. The spring here is the single most
// important thing in this folder, so it is worth reading first.

/**
 * Semi-implicit Euler spring.
 *
 * The portfolio currently eases everything with `v += (target - v) * 0.14`.
 * That is exponential smoothing. It has two properties that make motion read
 * as cheap no matter how the numbers are tuned:
 *
 *   1. It can never overshoot. It only ever approaches, so nothing lands with
 *      any weight. Award sites overshoot slightly and settle back.
 *   2. It is framerate dependent. The same 0.14 moves twice as far per second
 *      on a 120Hz display as on 60Hz, so the site literally feels different on
 *      different machines.
 *
 * A spring fixes both. It carries velocity between frames, so it arrives with
 * momentum, and it integrates against real elapsed time.
 *
 * Damping ratio = damping / (2 * sqrt(stiffness * mass)).
 *   < 1  underdamped, overshoots and settles. This is the alive one.
 *   = 1  critically damped, fastest approach with no overshoot.
 *   > 1  overdamped, sluggish.
 */
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
    get ratio() {
      return damping / (2 * Math.sqrt(stiffness * mass));
    },
    jump(t) {
      v = t;
      target = t;
      vel = 0;
    },
    step(dt) {
      // A tab switch can hand back a dt of several seconds. Integrating that
      // in one go sends the spring to infinity, so clamp it.
      const h = Math.min(dt, 1 / 30);
      const force = -stiffness * (v - target);
      const drag = -damping * vel;
      vel += ((force + drag) / mass) * h;
      v += vel * h;
      return v;
    },
    settled(eps = 0.005) {
      return Math.abs(v - target) < eps && Math.abs(vel) < eps;
    },
  };
}

/** Exponential smoothing, kept only so the demos can show it losing. */
export function createLerp({ ease = 0.14, value = 0 } = {}) {
  let v = value;
  let target = value;
  return {
    set ease(n) {
      ease = n;
    },
    set target(t) {
      target = t;
    },
    get value() {
      return v;
    },
    jump(t) {
      v = t;
      target = t;
    },
    step() {
      v += (target - v) * ease;
      return v;
    },
  };
}

/** One shared rAF loop. Ten separate loops would muddy every measurement. */
const tasks = new Set();
let last = performance.now();
let running = false;

function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  tasks.forEach((fn) => {
    try {
      fn(dt, now);
    } catch (err) {
      console.error('[lab] task failed', err);
    }
  });
  if (tasks.size) requestAnimationFrame(frame);
  else running = false;
}

export function onFrame(fn) {
  tasks.add(fn);
  if (!running) {
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  return () => tasks.delete(fn);
}

/** Builds a labelled slider row and calls back on input. */
export function controls(host, specs) {
  const bar = document.createElement('div');
  bar.className = 'ctls';
  const api = {};

  specs.forEach((s) => {
    if (s.type === 'button') {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = s.label;
      b.addEventListener('click', s.onClick);
      bar.appendChild(b);
      return;
    }
    const wrap = document.createElement('label');
    wrap.className = 'ctl';
    const label = document.createElement('span');
    label.className = 'ctl__label';
    const val = document.createElement('b');
    label.append(document.createTextNode(s.label), val);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = s.min;
    input.max = s.max;
    input.step = s.step ?? 1;
    input.value = s.value;

    const emit = () => {
      const n = parseFloat(input.value);
      val.textContent = s.format ? s.format(n) : String(n);
      s.onInput(n);
    };
    input.addEventListener('input', emit);
    wrap.append(label, input);
    bar.appendChild(wrap);
    api[s.key ?? s.label] = { input, emit };
    emit();
  });

  host.appendChild(bar);
  return api;
}

/**
 * Writes the how-it-works note under a demo.
 *
 * Takes trusted author-written literals from the modules in this folder only.
 * Never pass user input, URL params or fetched content through here. If this
 * ever needs dynamic content, switch to textContent or sanitise first.
 */
export function note(name, html) {
  const el = document.querySelector(`[data-note="${name}"]`);
  if (el) el.innerHTML = html;
}

export const stage = (name) => document.querySelector(`[data-stage="${name}"]`);

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
