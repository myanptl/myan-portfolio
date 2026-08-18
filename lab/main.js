import { springDemo, magneticDemo } from './motion.js';
import { cursorDemo } from './cursor.js';
import { splitDemo, blurDemo, weightDemo } from './type.js';
import { scrollVelocityDemo, wipeDemo } from './scroll.js';
import { grainDemo, displaceDemo } from './surface.js';

const demos = [
  ['spring', 'Spring vs lerp', springDemo],
  ['cursor', 'Velocity cursor', cursorDemo],
  ['magnetic', 'Magnetic, sprung', magneticDemo],
  ['split', 'Two tier split', splitDemo],
  ['blur', 'Blur reveal', blurDemo],
  ['weight', 'Weight wave', weightDemo],
  ['scroll', 'Scroll velocity', scrollVelocityDemo],
  ['wipe', 'Clip wipe', wipeDemo],
  ['grain', 'Grain', grainDemo],
  ['displace', 'Displacement', displaceDemo],
];

const nav = document.getElementById('rail-nav');

demos.forEach(([id, label], i) => {
  const section = document.getElementById(id);
  const a = document.createElement('a');
  a.className = 'rail__link';
  a.href = `#${id}`;
  const dot = document.createElement('span');
  dot.className = 'dot';
  dot.dataset.v = section ? section.dataset.verdict : 'fits';
  a.append(dot, document.createTextNode(`${String(i + 1).padStart(2, '0')} ${label}`));
  nav.appendChild(a);
});

// Each demo is isolated so one failure cannot take the page down with it.
demos.forEach(([id, label, run]) => {
  try {
    run();
  } catch (err) {
    console.error(`[lab] "${label}" failed to mount`, err);
    const el = document.querySelector(`[data-stage="${id}"]`);
    if (el) {
      el.style.display = 'grid';
      el.style.placeItems = 'center';
      el.textContent = `${label} failed to mount, see console`;
    }
  }
});

// Highlight whichever demo is currently in view.
const links = [...nav.querySelectorAll('.rail__link')];
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${e.target.id}`));
    });
  },
  { threshold: 0.3 }
);
demos.forEach(([id]) => {
  const s = document.getElementById(id);
  if (s) io.observe(s);
});

console.info('[lab] mounted', demos.length, 'demos');
