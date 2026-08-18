// 02 velocity cursor. Reproduces the mechanic measured on cuberto.com.
//
// What the live site actually reported, read off computed styles:
//   .cb-cursor  position fixed, z-index 500, pointer-events none,
//               mix-blend-mode exclusion,
//               transform matrix(-0.9487, -0.3162, 0.3162, -0.9487, 600, 400)
//   .cb-cursor-inner
//               transform matrix(-0.9487,  0.3162, -0.3162, -0.9487, 0, 0)
//
// The outer matrix carries a rotation. The inner carries its exact inverse.
// That is the whole trick: the shell rotates to face the direction of travel so
// it can be stretched along the velocity vector, and the inner element
// counter-rotates so any icon or label inside stays upright.
//
// States are declarative. Cuberto marks targets with data-cursor="-inverse"
// and data-cursor-icon="play|times|arrow-up-right", and one global controller
// reads them on pointerover. Copied here because it keeps the state machine out
// of every component.

import { createSpring, onFrame, controls, note, stage } from './core.js';

const style = document.createElement('style');
style.textContent = `
.cur { position: relative; min-height: 300px; padding: 2.5rem; display: flex;
  flex-direction: column; gap: 1.6rem; align-items: flex-start; justify-content: center;
  cursor: none; isolation: isolate; }
.cur * { cursor: none; }
.cur__h { font-size: clamp(1.5rem, 1rem + 2vw, 2.6rem); font-weight: 500; letter-spacing: -0.03em;
  line-height: 1.1; max-width: 22ch; }
.cur__row { display: flex; gap: 1.6rem; flex-wrap: wrap; align-items: center; }
.cur__link { font-size: 1.05rem; color: var(--fg); text-decoration: none;
  border-bottom: 1px solid var(--rule); padding-bottom: 2px; }
.cur__tile { width: 190px; height: 108px; border: 1px solid var(--rule); border-radius: 2px;
  background: linear-gradient(135deg, hsl(250 45% 26%), hsl(222 45% 20%));
  display: grid; place-items: center; font-family: 'Plex Mono', monospace; font-size: 0.62rem;
  letter-spacing: 0.09em; color: var(--fg-45); }
.cur__cursor { position: absolute; top: 0; left: 0; width: 18px; height: 18px; margin: -9px 0 0 -9px;
  border-radius: 999px; background: #fff; mix-blend-mode: exclusion; pointer-events: none;
  z-index: 40; will-change: transform; display: grid; place-items: center; }
.cur__inner { font-family: 'Plex Mono', monospace; font-size: 0.55rem; letter-spacing: 0.1em;
  color: #000; opacity: 0; white-space: nowrap; will-change: transform; }
.cur__cursor[data-state="link"] { width: 46px; height: 46px; margin: -23px 0 0 -23px; }
.cur__cursor[data-state="view"] { width: 88px; height: 88px; margin: -44px 0 0 -44px; }
.cur__cursor[data-state="view"] .cur__inner,
.cur__cursor[data-state="link"] .cur__inner { opacity: 1; }
.cur__cursor { transition: width 380ms cubic-bezier(0.16,1,0.3,1), height 380ms cubic-bezier(0.16,1,0.3,1), margin 380ms cubic-bezier(0.16,1,0.3,1); }
`;
document.head.appendChild(style);

export function cursorDemo() {
  const host = stage('cursor');
  const wrap = document.createElement('div');
  wrap.className = 'cur';

  const h = document.createElement('p');
  h.className = 'cur__h';
  h.textContent = 'Move fast and the dot stretches along the direction it is travelling.';

  const row = document.createElement('div');
  row.className = 'cur__row';

  const link = document.createElement('a');
  link.className = 'cur__link';
  link.href = '#cursor';
  link.textContent = 'A link, hover it';
  link.dataset.cursor = 'link';
  link.dataset.cursorLabel = 'OPEN';

  const tile = document.createElement('div');
  tile.className = 'cur__tile';
  tile.textContent = 'A WORK TILE';
  tile.dataset.cursor = 'view';
  tile.dataset.cursorLabel = 'VIEW';

  row.append(link, tile);

  const cursor = document.createElement('div');
  cursor.className = 'cur__cursor';
  cursor.dataset.state = 'idle';
  const inner = document.createElement('span');
  inner.className = 'cur__inner';
  cursor.appendChild(inner);

  wrap.append(h, row, cursor);
  host.appendChild(wrap);

  const sx = createSpring({ stiffness: 260, damping: 20 });
  const sy = createSpring({ stiffness: 260, damping: 20 });
  let stretch = 0.0016;
  let angle = 0;
  let visible = false;

  wrap.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    if (!visible) {
      visible = true;
      sx.jump(e.clientX - r.left);
      sy.jump(e.clientY - r.top);
      cursor.style.opacity = '1';
    }
    sx.target = e.clientX - r.left;
    sy.target = e.clientY - r.top;
  });

  wrap.addEventListener('pointerleave', () => {
    visible = false;
    cursor.style.opacity = '0';
  });
  cursor.style.opacity = '0';
  cursor.style.transitionProperty = 'width, height, margin, opacity';

  // Declarative state machine, the part worth copying.
  wrap.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    cursor.dataset.state = t ? t.dataset.cursor : 'idle';
    inner.textContent = t ? t.dataset.cursorLabel || '' : '';
  });

  controls(host, [
    {
      key: 'st',
      label: 'stiffness',
      min: 60,
      max: 600,
      value: 260,
      onInput: (n) => {
        sx.stiffness = n;
        sy.stiffness = n;
      },
    },
    {
      key: 'dp',
      label: 'damping',
      min: 6,
      max: 50,
      value: 20,
      onInput: (n) => {
        sx.damping = n;
        sy.damping = n;
      },
    },
    { key: 'sr', label: 'stretch', min: 0, max: 0.006, step: 0.0002, value: 0.0016, onInput: (n) => (stretch = n), format: (n) => n.toFixed(4) },
  ]);

  note(
    'cursor',
    `Velocity comes free out of the spring, so direction and stretch cost nothing extra:
     <code>angle = atan2(vy, vx)</code> and speed is the vector length.
     <br><br>The outer element gets <code>translate → rotate(angle) → scale(1 + speed, 1 - speed)</code>
     and the inner gets <code>rotate(-angle)</code>. That counter-rotation is why the label stays
     readable while the shell is stretched sideways. Angle only updates above a small speed threshold,
     otherwise the cursor spins randomly when it is nearly still.
     <br><br><strong>The part that matters for your site specifically:</strong>
     <code>mix-blend-mode: exclusion</code> means the cursor inverts against whatever is behind it. Your
     page alternates ink and paper grounds, so a normal coloured cursor would need to know the current
     polarity. A blend cursor never does. It is correct on both by construction.`
  );

  onFrame((dt) => {
    sx.step(dt);
    sy.step(dt);
    const vx = sx.velocity;
    const vy = sy.velocity;
    const speed = Math.hypot(vx, vy);
    if (speed > 40) angle = Math.atan2(vy, vx);
    const s = Math.min(speed * stretch, 0.6);
    const deg = (angle * 180) / Math.PI;
    cursor.style.transform =
      `translate3d(${sx.value.toFixed(2)}px, ${sy.value.toFixed(2)}px, 0) ` +
      `rotate(${deg.toFixed(2)}deg) scale(${(1 + s).toFixed(3)}, ${(1 - s * 0.6).toFixed(3)})`;
    inner.style.transform = `rotate(${(-deg).toFixed(2)}deg)`;
  });
}
