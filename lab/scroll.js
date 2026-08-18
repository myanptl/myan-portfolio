// 07 scroll velocity as an input, 08 clip wipe against the fade up.

import { createSpring, onFrame, controls, note, stage, clamp } from './core.js';

const style = document.createElement('style');
style.textContent = `
.sv { height: 300px; overflow-y: auto; position: relative; }
.sv__inner { padding: 130px 2rem; display: flex; flex-direction: column; gap: 1rem; }
.sv__row { font-size: clamp(1.2rem, 1rem + 1.4vw, 2.2rem); font-weight: 500; letter-spacing: -0.03em;
  will-change: transform; transform-origin: left center; }
.sv__meter { position: absolute; top: 10px; right: 14px; font-family: 'Plex Mono', monospace;
  font-size: 0.6rem; letter-spacing: 0.08em; color: var(--fg-45); pointer-events: none; z-index: 3; }

.cw { height: 320px; overflow-y: auto; }
.cw__inner { padding: 170px 2rem; display: flex; flex-direction: column; gap: 3.5rem; }
.cw__cell { display: flex; flex-direction: column; gap: 0.7rem; }
.cw__tag { font-family: 'Plex Mono', monospace; font-size: 0.6rem; letter-spacing: 0.09em;
  color: var(--fg-45); }
.cw__panel { border: 1px solid var(--rule); border-radius: 2px; padding: 1.4rem 1.5rem;
  background: linear-gradient(120deg, hsl(250 40% 22%), hsl(222 40% 17%)); }
.cw__panel h4 { font-size: 1.25rem; font-weight: 500; letter-spacing: -0.02em; margin-bottom: 0.4rem; }
.cw__panel p { color: var(--fg-70); font-size: 0.92rem; line-height: 1.55; }
.cw__fade { opacity: 0; transform: translateY(26px);
  transition: opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1); }
.cw__fade.is-in { opacity: 1; transform: none; }
.cw__wipe { clip-path: inset(0 100% 0 0); transition: clip-path 850ms cubic-bezier(0.16,1,0.3,1); }
.cw__wipe.is-in { clip-path: inset(0 0% 0 0); }
`;
document.head.appendChild(style);

export function scrollVelocityDemo() {
  const host = stage('scroll');
  const sc = document.createElement('div');
  sc.className = 'sv';
  const inner = document.createElement('div');
  inner.className = 'sv__inner';
  const meter = document.createElement('p');
  meter.className = 'sv__meter';
  meter.textContent = 'VELOCITY 0.000';

  const rows = ['FocusOS', 'PromptProbe', 'VulnScan', 'SlideAir', 'RepoRoast', 'EquityLens', 'KeyHound'].map(
    (t) => {
      const d = document.createElement('div');
      d.className = 'sv__row';
      d.textContent = t;
      inner.appendChild(d);
      return d;
    }
  );

  sc.appendChild(inner);
  host.append(sc, meter);

  const vel = createSpring({ stiffness: 120, damping: 18 });
  let lastTop = 0;
  let skewAmt = 5;
  let scaleAmt = 0.06;

  sc.addEventListener(
    'scroll',
    () => {
      const d = sc.scrollTop - lastTop;
      lastTop = sc.scrollTop;
      vel.target = clamp(d / 26, -1, 1);
    },
    { passive: true }
  );

  controls(host, [
    { key: 'sk', label: 'skew deg', min: 0, max: 16, step: 0.5, value: 5, onInput: (n) => (skewAmt = n) },
    { key: 'sc', label: 'scale', min: 0, max: 0.25, step: 0.01, value: 0.06, onInput: (n) => (scaleAmt = n) },
    {
      key: 'st',
      label: 'settle',
      min: 30,
      max: 300,
      value: 120,
      onInput: (n) => {
        vel.stiffness = n;
      },
    },
  ]);

  note(
    'scroll',
    `You already publish <code>--scroll-velocity</code> from the lerped scroller and clamp it to
     <code>-1..1</code>. You just barely spend it. Here the same signal drives
     <code>skewY</code> and a slight vertical scale, so the list compresses into the direction of travel
     and springs back when the scroll stops.
     <br><br>The reason this feels different from a plain transform is that velocity decays through a
     spring rather than snapping to zero the instant scrolling stops. That trailing settle is the whole
     effect. Set settle low and it wallows, set it high and it goes rigid.
     <br><br>Keep it well under the point where text becomes unreadable. Around 4 to 6 degrees is where
     it registers without anyone consciously noticing, which is the target.`
  );

  onFrame((dt) => {
    if (Math.abs(vel.target) > 0.001) vel.target *= 0.86;
    vel.step(dt);
    const v = vel.value;
    meter.textContent = `VELOCITY ${v.toFixed(3)}`;
    rows.forEach((r, i) => {
      const lag = 1 - i * 0.06;
      r.style.transform = `skewY(${(v * skewAmt * lag).toFixed(3)}deg) scaleY(${(1 + Math.abs(v) * scaleAmt).toFixed(4)})`;
    });
  });
}

export function wipeDemo() {
  const host = stage('wipe');
  const sc = document.createElement('div');
  sc.className = 'cw';
  const inner = document.createElement('div');
  inner.className = 'cw__inner';

  const make = (tag, cls, title, body) => {
    const cell = document.createElement('div');
    cell.className = 'cw__cell';
    const t = document.createElement('span');
    t.className = 'cw__tag';
    t.textContent = tag;
    const panel = document.createElement('div');
    panel.className = `cw__panel ${cls}`;
    const h4 = document.createElement('h4');
    h4.textContent = title;
    const p = document.createElement('p');
    p.textContent = body;
    panel.append(h4, p);
    cell.append(t, panel);
    inner.appendChild(cell);
    return panel;
  };

  const panels = [
    make('WHAT YOU DO NOW', 'cw__fade', 'Fade up', 'Opacity and a 26px rise. The same wrapper on every section.'),
    make('CLIP WIPE', 'cw__wipe', 'Clip wipe', 'inset() travelling left to right. The panel is uncovered, not faded in.'),
    make('WHAT YOU DO NOW', 'cw__fade', 'Fade up', 'Identical to the first, because that is the point.'),
    make('CLIP WIPE', 'cw__wipe', 'Clip wipe', 'Direction carries meaning. Fading carries none.'),
  ];

  sc.appendChild(inner);
  host.appendChild(sc);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-in', e.isIntersecting));
    },
    { root: sc, threshold: 0.55 }
  );
  panels.forEach((p) => io.observe(p));

  note(
    'wipe',
    `Scroll the panel. Both do the same job, and one of them is the single loudest tell in the feedback
     you gave me in August: <em>the same scroll fade up wrapper on every section</em>.
     <br><br><code>clip-path: inset(0 100% 0 0)</code> to <code>inset(0 0 0 0)</code> uncovers the panel
     from one edge. It is compositor friendly, it is one line, and unlike opacity it has a
     <strong>direction</strong>, which means it can mean something: wipe toward the reading edge on the
     way in, away from it on the way out.
     <br><br>Codrops published a piece in May 2026 on exactly this, shader uniforms and clip-path wipes
     driving a portfolio, so it is current practice rather than a trick from 2019.`
  );
}
