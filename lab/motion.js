// 01 spring against lerp, and 03 magnetic rebuilt on a spring.

import { createSpring, createLerp, onFrame, controls, note, stage, clamp } from './core.js';

const style = document.createElement('style');
style.textContent = `
.sp { padding: 1.6rem 1.4rem; display: flex; flex-direction: column; gap: 1.15rem; }
.sp__row { position: relative; height: 30px; display: flex; align-items: center; gap: 1rem; }
.sp__tag { font-family: 'Plex Mono', monospace; font-size: 0.62rem; letter-spacing: 0.09em;
  color: var(--fg-45); width: 96px; flex: none; }
.sp__track { position: relative; flex: 1; height: 100%; border-bottom: 1px solid var(--rule); }
.sp__dot { position: absolute; top: 50%; left: 0; width: 14px; height: 14px; margin: -7px 0 0 -7px;
  border-radius: 50%; background: var(--accent); will-change: transform; }
.sp__dot--lerp { background: var(--fg-45); }
.sp__dot--t { background: transparent; border: 1px solid var(--fg-45); }
.sp__hint { font-family: 'Plex Mono', monospace; font-size: 0.62rem; color: var(--fg-45);
  padding: 0 1.4rem 1.2rem; letter-spacing: 0.05em; }
.mag { display: flex; gap: 2.5rem; align-items: center; justify-content: center;
  min-height: 220px; flex-wrap: wrap; padding: 2rem; }
.mag__cell { display: flex; flex-direction: column; align-items: center; gap: 0.9rem; }
.mag__tag { font-family: 'Plex Mono', monospace; font-size: 0.62rem; letter-spacing: 0.09em;
  color: var(--fg-45); }
.mag__btn { font-family: 'Switzer', sans-serif; font-size: 1.05rem; padding: 0.85rem 1.7rem;
  border: 1px solid var(--rule); border-radius: 2px; color: var(--fg); background: transparent;
  will-change: transform; }
`;
document.head.appendChild(style);

export function springDemo() {
  const host = stage('spring');
  const wrap = document.createElement('div');
  wrap.className = 'sp';

  const rows = [
    ['SPRING', 'sp__dot'],
    ['LERP 0.14', 'sp__dot sp__dot--lerp'],
    ['TARGET', 'sp__dot sp__dot--t'],
  ].map(([label, cls]) => {
    const row = document.createElement('div');
    row.className = 'sp__row';
    const tag = document.createElement('span');
    tag.className = 'sp__tag';
    tag.textContent = label;
    const track = document.createElement('div');
    track.className = 'sp__track';
    const dot = document.createElement('i');
    dot.className = cls;
    track.appendChild(dot);
    row.append(tag, track);
    wrap.appendChild(row);
    return { track, dot };
  });

  const hint = document.createElement('p');
  hint.className = 'sp__hint';
  hint.textContent = 'MOVE THE POINTER ACROSS, OR HIT KICK FOR A CLEAN STEP RESPONSE';

  host.append(wrap, hint);

  const spring = createSpring({ stiffness: 170, damping: 22, value: 0 });
  const lerp = createLerp({ ease: 0.14, value: 0 });
  let target = 0;
  let width = 1;

  const measure = () => {
    width = rows[0].track.clientWidth || 1;
  };
  measure();
  new ResizeObserver(measure).observe(host);

  host.addEventListener('pointermove', (e) => {
    const r = rows[0].track.getBoundingClientRect();
    target = clamp(e.clientX - r.left, 0, r.width);
  });

  const ctl = controls(host, [
    {
      key: 'stiff',
      label: 'stiffness',
      min: 20,
      max: 400,
      value: 170,
      onInput: (n) => {
        spring.stiffness = n;
        readout();
      },
    },
    {
      key: 'damp',
      label: 'damping',
      min: 4,
      max: 60,
      value: 22,
      onInput: (n) => {
        spring.damping = n;
        readout();
      },
    },
    {
      key: 'ease',
      label: 'lerp ease',
      min: 0.02,
      max: 0.5,
      step: 0.01,
      value: 0.14,
      onInput: (n) => {
        lerp.ease = n;
      },
    },
    {
      type: 'button',
      label: 'Kick',
      onClick: () => {
        target = target > width / 2 ? width * 0.08 : width * 0.92;
      },
    },
  ]);

  function readout() {
    const r = spring.ratio;
    const kind = r < 0.98 ? 'underdamped, overshoots' : r > 1.02 ? 'overdamped, sluggish' : 'critically damped';
    note(
      'spring',
      `Both dots chase the same target. The spring carries <strong>velocity</strong> between frames so it
       arrives with momentum and settles past the mark. The lerp only ever approaches, which is why it
       reads as soft no matter how you tune it.
       <br><br>Damping ratio right now is <code>${r.toFixed(2)}</code>, ${kind}.
       Ratio is <code>damping / (2 * sqrt(stiffness * mass))</code>. Below 1 it overshoots, and that
       overshoot is most of what people mean when they call motion expensive.
       <br><br>The second difference is quieter and worse. Your lerp runs per frame, so
       <code>0.14</code> travels twice as far per second on a 120Hz display as on 60Hz. The spring
       integrates against real elapsed time, so it behaves the same everywhere.`
    );
  }
  readout();

  onFrame((dt) => {
    spring.target = target;
    lerp.target = target;
    spring.step(dt);
    lerp.step();
    rows[0].dot.style.transform = `translateX(${spring.value.toFixed(2)}px)`;
    rows[1].dot.style.transform = `translateX(${lerp.value.toFixed(2)}px)`;
    rows[2].dot.style.transform = `translateX(${target.toFixed(2)}px)`;
  });

  return ctl;
}

export function magneticDemo() {
  const host = stage('magnetic');
  const wrap = document.createElement('div');
  wrap.className = 'mag';

  const cells = ['LERP, WHAT YOU SHIP NOW', 'SPRING'].map((label) => {
    const cell = document.createElement('div');
    cell.className = 'mag__cell';
    const tag = document.createElement('span');
    tag.className = 'mag__tag';
    tag.textContent = label;
    const btn = document.createElement('button');
    btn.className = 'mag__btn';
    btn.textContent = 'Get in touch';
    cell.append(tag, btn);
    wrap.appendChild(cell);
    return btn;
  });

  host.appendChild(wrap);

  let strength = 0.32;
  let radius = 90;

  const sx = createSpring({ stiffness: 220, damping: 17 });
  const sy = createSpring({ stiffness: 220, damping: 17 });
  const lx = createLerp({ ease: 0.16 });
  const ly = createLerp({ ease: 0.16 });

  const pull = (btn) => {
    const r = btn.getBoundingClientRect();
    return { r, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  };

  let px = -9999;
  let py = -9999;
  window.addEventListener('pointermove', (e) => {
    px = e.clientX;
    py = e.clientY;
  });

  controls(host, [
    { key: 'str', label: 'strength', min: 0.05, max: 1, step: 0.01, value: 0.32, onInput: (n) => (strength = n) },
    { key: 'rad', label: 'radius', min: 20, max: 260, value: 90, onInput: (n) => (radius = n) },
    {
      key: 'st',
      label: 'stiffness',
      min: 40,
      max: 500,
      value: 220,
      onInput: (n) => {
        sx.stiffness = n;
        sy.stiffness = n;
      },
    },
    {
      key: 'dp',
      label: 'damping',
      min: 4,
      max: 50,
      value: 17,
      onInput: (n) => {
        sx.damping = n;
        sy.damping = n;
      },
    },
  ]);

  note(
    'magnetic',
    `Same pull maths on both, only the integrator differs. Hover each and pull away sharply.
     The lerp one glides home. The sprung one <strong>whips past centre and settles</strong>, which is
     the detail that makes a link feel physical rather than animated.
     <br><br>Your <code>useMagnetic</code> is already structured correctly, writing transforms directly
     instead of through React state. Swapping its two lerp lines for a spring is a contained change to
     one file and would lift every link on the page at once.`
  );

  onFrame((dt) => {
    [cells[0], cells[1]].forEach((btn, i) => {
      const { r, cx, cy } = pull(btn);
      const dx = px - cx;
      const dy = py - cy;
      const near = Math.hypot(dx, dy) < r.width / 2 + radius;
      const tx = near ? dx * strength : 0;
      const ty = near ? dy * strength : 0;
      if (i === 0) {
        lx.target = tx;
        ly.target = ty;
        lx.step();
        ly.step();
        btn.style.transform = `translate3d(${lx.value.toFixed(2)}px, ${ly.value.toFixed(2)}px, 0)`;
      } else {
        sx.target = tx;
        sy.target = ty;
        sx.step(dt);
        sy.step(dt);
        btn.style.transform = `translate3d(${sx.value.toFixed(2)}px, ${sy.value.toFixed(2)}px, 0)`;
      }
    });
  });
}
