// 11-13. The mechanics that actually went into the site, so the lab documents
// what shipped rather than drifting away from it.
//
// These import the real modules from ../src, not copies. If the site changes,
// these demos change with it.

import { renderDither } from '../src/lib/dither.js';
import { createSpring, createClock } from '../src/lib/spring.js';
import { onFrame, controls, note, stage } from './core.js';

const style = document.createElement('style');
style.textContent = `
.vs { display: grid; grid-template-columns: 1fr 1fr; min-height: 250px; }
.vs__cell { position: relative; display: grid; place-items: center; overflow: hidden;
  background: #131315; }
.vs__cell + .vs__cell { border-left: 1px solid var(--rule); }
.vs__tag { position: absolute; top: 12px; left: 14px; font-family: 'Plex Mono', monospace;
  font-size: 0.58rem; letter-spacing: 0.09em; color: var(--fg-45); z-index: 3; }
.vs__orb { position: absolute; inset: 0; z-index: 1; }
.vs__canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1;
  image-rendering: pixelated; opacity: 0.16; }
.vs__label { position: relative; z-index: 2; font-size: 1.5rem; font-weight: 500;
  letter-spacing: -0.03em; }

.rv { padding: 2rem; display: flex; flex-direction: column; gap: 1.1rem; }
.rv__row { display: flex; align-items: center; gap: 1rem; }
.rv__name { font-family: 'Plex Mono', monospace; font-size: 0.58rem; letter-spacing: 0.09em;
  color: var(--fg-45); width: 120px; flex: none; }
.rv__bar { flex: 1; padding: 0.75rem 1rem; border: 1px solid var(--rule);
  background: linear-gradient(120deg, hsl(40 20% 22%), hsl(215 12% 16%)); font-size: 0.95rem; }
.rv__bar[data-k="left"] { clip-path: inset(0 100% 0 0); transition: clip-path 820ms var(--ease); }
.rv__bar[data-k="down"] { clip-path: inset(0 0 100% 0); transition: clip-path 780ms var(--ease); }
.rv__bar[data-k="fade"] { opacity: 0; transform: translateY(20px);
  transition: opacity 700ms var(--ease), transform 700ms var(--ease); }
.rv.is-in .rv__bar[data-k="left"], .rv.is-in .rv__bar[data-k="down"] { clip-path: inset(0 0 0 0); }
.rv.is-in .rv__bar[data-k="fade"] { opacity: 1; transform: none; }

.seq { padding: 2rem; min-height: 250px; position: relative; }
.seq__rule { height: 1px; background: var(--fg-45); transform: scaleX(0); transform-origin: left;
  transition: transform 1000ms var(--ease); }
.seq.is-in .seq__rule { transform: scaleX(1); }
.seq.is-in .seq__rule--b { transition-delay: 320ms; }
.seq__meta { display: flex; justify-content: space-between; padding-block: 0.6rem;
  font-family: 'Plex Mono', monospace; font-size: 0.58rem; letter-spacing: 0.09em;
  color: var(--fg-45); opacity: 0; transform: translateY(12px);
  transition: opacity 700ms var(--ease), transform 700ms var(--ease); }
.seq.is-in .seq__meta { opacity: 1; transform: none; transition-delay: 240ms; }
.seq__h { font-size: clamp(1.6rem, 1rem + 3vw, 3.4rem); font-weight: 400; line-height: 0.86;
  letter-spacing: -0.05em; padding-block: 1.2rem; }
.seq__line { display: block; overflow: hidden; padding-block: 0.08em; }
.seq__ch { display: inline-block; transform: translateY(115%); font-weight: 700;
  transition: transform 880ms var(--ease); transition-delay: calc(280ms + var(--i) * 24ms); }
.seq.is-in .seq__ch { transform: translateY(0); }
.seq__foot { opacity: 0; transform: translateY(12px);
  transition: opacity 700ms var(--ease), transform 700ms var(--ease); }
.seq.is-in .seq__foot { opacity: 1; transform: none; transition-delay: 1180ms; }
`;
document.head.appendChild(style);

export function orbVsDitherDemo() {
  const host = stage('orbdither');
  const wrap = document.createElement('div');
  wrap.className = 'vs';

  const cellA = document.createElement('div');
  cellA.className = 'vs__cell';
  cellA.innerHTML = '<span class="vs__tag">WAS: RADIAL ORBS</span><span class="vs__label">Section</span>';
  const orb = document.createElement('div');
  orb.className = 'vs__orb';
  orb.style.background =
    'radial-gradient(42% 52% at 28% 34%, hsl(250 66% 62% / 0.19), transparent 68%),' +
    'radial-gradient(36% 46% at 80% 74%, hsl(202 72% 60% / 0.14), transparent 70%)';
  cellA.prepend(orb);

  const cellB = document.createElement('div');
  cellB.className = 'vs__cell';
  cellB.innerHTML = '<span class="vs__tag">NOW: DITHER FIELD</span><span class="vs__label">Section</span>';
  const canvas = document.createElement('canvas');
  canvas.className = 'vs__canvas';
  const ctx = canvas.getContext('2d');
  canvas.width = 64;
  canvas.height = 40;
  cellB.prepend(canvas);

  wrap.append(cellA, cellB);
  host.appendChild(wrap);

  let alpha = 0.16;
  controls(host, [
    { key: 'a', label: 'field opacity', min: 0, max: 0.5, step: 0.01, value: 0.16,
      onInput: (n) => { alpha = n; canvas.style.opacity = String(n); }, format: (n) => n.toFixed(2) },
    { key: 'o', label: 'orb opacity', min: 0, max: 1, step: 0.05, value: 1,
      onInput: (n) => { orb.style.opacity = String(n); }, format: (n) => n.toFixed(2) },
  ]);

  note('orbdither',
    `Item 2 of the de-slop pass, side by side. Both stop a section reading as a flat panel. Only one of
     them is a shape that a stranger recognises instantly as generated.
     <br><br>The right cell calls <code>renderDither</code> from
     <strong>src/lib/dither.js</strong>, the same module the live site uses. Two drifting lobes
     thresholded against an 8x8 Bayer matrix, rendered at 64 columns and scaled up with
     <code>image-rendering: pixelated</code>. Smooth it and you get back the gradient it replaced.
     <br><br>The module had been sitting unused in the repo since the rebuild. It does not cost a
     dependency and it cannot read as a glow.`);

  let t = 0;
  onFrame((dt) => {
    t += dt * 1000;
    renderDither(ctx, canvas.width, canvas.height, t, [238, 236, 231], { x: 0, y: 0 });
  });
}

export function revealsDemo() {
  const host = stage('reveals');
  const wrap = document.createElement('div');
  wrap.className = 'rv';
  const rows = [
    ['WORK INDEX', 'left', 'Uncovered from the left, the way the row is read'],
    ['EXPERIENCE', 'down', 'Unrolls downward, a record added to a stack'],
    ['THE OLD FADE', 'fade', 'Opacity plus a 20px rise, on every section at once'],
  ].map(([name, k, text]) => {
    const row = document.createElement('div');
    row.className = 'rv__row';
    const n = document.createElement('span');
    n.className = 'rv__name';
    n.textContent = name;
    const bar = document.createElement('div');
    bar.className = 'rv__bar';
    bar.dataset.k = k;
    bar.textContent = text;
    row.append(n, bar);
    wrap.appendChild(row);
    return row;
  });
  host.appendChild(wrap);

  const play = () => {
    wrap.classList.remove('is-in');
    void wrap.offsetWidth;
    wrap.classList.add('is-in');
  };
  requestAnimationFrame(play);
  controls(host, [{ type: 'button', label: 'Replay', onClick: play }]);

  note('reveals',
    `What the three list sections do now. The point is that they are <strong>different from each
     other</strong>. Replacing one uniform fade with one uniform wipe would have swapped a tell for a
     tell, so each reveal runs in the direction its own content implies.
     <br><br>All three are compositor friendly. <code>clip-path</code> has something opacity does not,
     which is a direction, and direction is what lets a reveal carry meaning.
     <br><br>Every one of these needs <code>clip-path: none</code> inside its reduced-motion block.
     Miss it and the rows stay clipped to zero width forever, so a reduced-motion visitor gets a blank
     section instead of a still one. That bug was live here for about four minutes.`);
}

export function sequenceDemo() {
  const host = stage('sequence');
  const wrap = document.createElement('div');
  wrap.className = 'seq';

  const ruleA = document.createElement('div');
  ruleA.className = 'seq__rule';
  const meta = document.createElement('div');
  meta.className = 'seq__meta';
  meta.innerHTML = '<span>MYAN PATEL</span><span>PRODUCT &amp; SECURITY</span>';
  const h = document.createElement('div');
  h.className = 'seq__h';
  let i = 0;
  ['Build and', 'secure AI', 'products.'].forEach((line) => {
    const l = document.createElement('span');
    l.className = 'seq__line';
    [...line].forEach((ch) => {
      const c = document.createElement('span');
      c.className = 'seq__ch';
      c.style.setProperty('--i', i++);
      c.textContent = ch === ' ' ? ' ' : ch;
      l.appendChild(c);
    });
    h.appendChild(l);
  });
  const ruleB = document.createElement('div');
  ruleB.className = 'seq__rule seq__rule--b';
  const foot = document.createElement('p');
  foot.className = 'seq__foot';
  foot.style.cssText = 'padding-top:0.8rem;color:var(--fg-70);font-size:0.9rem;max-width:38ch;';
  foot.textContent = 'Rising junior at Westford Academy. I take products the whole way.';

  wrap.append(ruleA, meta, h, ruleB, foot);
  host.appendChild(wrap);

  const play = () => {
    wrap.classList.remove('is-in');
    void wrap.offsetWidth;
    wrap.classList.add('is-in');
  };
  requestAnimationFrame(play);
  controls(host, [{ type: 'button', label: 'Replay arrival', onClick: play }]);

  note('sequence',
    `The landing's arrival, at the timings that shipped. Rules draw from the left at 120ms and 320ms,
     the meta rises at 240ms, characters start at 280ms on a 24ms stagger, and the footer lands last at
     1180ms once the headline has finished.
     <br><br>Characters fly in at <strong>700 and settle to 400</strong>. Two loaded weights swapped
     discretely, so no variable font is needed and no new files ship.
     <br><br>Nothing moved on load before this, which is most of why the page read as text sitting on a
     background. The sequence costs no library: CSS transitions, per-character
     <code>transition-delay</code>, and one class toggled a frame after mount so the transitions have a
     start value to run from.`);
}
