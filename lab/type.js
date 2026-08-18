// 04 two tier split, 05 blur reveal, 06 weight wave.

import { onFrame, controls, note, stage, clamp } from './core.js';

const style = document.createElement('style');
style.textContent = `
.sl { padding: 2.5rem 2rem; }
.sl__line { overflow: hidden; display: block; padding-block: 0.06em; }
.sl__char { display: inline-block; transform: translateY(110%); will-change: transform;
  transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1); transition-delay: var(--d); }
.sl.is-in .sl__char { transform: translateY(0); }
.sl__h { font-size: clamp(1.6rem, 1rem + 2.6vw, 3.1rem); font-weight: 400; line-height: 1.08;
  letter-spacing: -0.03em; }
.sl__char.isBold { font-weight: 700; }

.br { height: 260px; overflow-y: auto; padding: 0 2rem; scrollbar-width: thin; }
.br__inner { padding-block: 130px; }
.br__p { font-size: clamp(1.15rem, 1rem + 1vw, 1.9rem); font-weight: 400; line-height: 1.45;
  letter-spacing: -0.02em; max-width: 30ch; }
.br__w { display: inline-block; will-change: filter, opacity; }

.ww { padding: 3rem 2rem; display: grid; place-items: center; min-height: 240px; }
.ww__h { font-size: clamp(1.7rem, 1rem + 3vw, 3.4rem); line-height: 1.1; letter-spacing: -0.03em;
  text-align: center; max-width: 18ch; }
.ww__c { display: inline-block; transition: font-weight 120ms linear; will-change: transform; }
`;
document.head.appendChild(style);

const splitChars = (text, lineEl) => {
  const chars = [];
  [...text].forEach((ch) => {
    const s = document.createElement('span');
    s.className = 'sl__char';
    s.textContent = ch === ' ' ? ' ' : ch;
    lineEl.appendChild(s);
    chars.push(s);
  });
  return chars;
};

export function splitDemo() {
  const host = stage('split');
  const wrap = document.createElement('div');
  wrap.className = 'sl';
  const h = document.createElement('p');
  h.className = 'sl__h';
  wrap.appendChild(h);
  host.appendChild(wrap);

  const lines = ['Build the thing.', 'Then break it', 'on purpose.'];
  let stagger = 22;
  let weightSwap = true;
  let all = [];

  const build = () => {
    h.textContent = '';
    all = [];
    lines.forEach((text) => {
      const line = document.createElement('span');
      line.className = 'sl__line';
      all.push(...splitChars(text, line));
      h.appendChild(line);
    });
    all.forEach((c, i) => c.style.setProperty('--d', `${i * stagger}ms`));
  };

  const play = () => {
    wrap.classList.remove('is-in');
    all.forEach((c) => c.classList.remove('isBold'));
    void wrap.offsetWidth; // force reflow so the transition restarts
    if (weightSwap) all.forEach((c) => c.classList.add('isBold'));
    wrap.classList.add('is-in');
    if (weightSwap) {
      all.forEach((c, i) => {
        setTimeout(() => c.classList.remove('isBold'), i * stagger + 620);
      });
    }
  };

  build();
  requestAnimationFrame(play);

  controls(host, [
    {
      key: 'stag',
      label: 'stagger ms',
      min: 0,
      max: 70,
      value: 22,
      onInput: (n) => {
        stagger = n;
        all.forEach((c, i) => c.style.setProperty('--d', `${i * n}ms`));
      },
    },
    { type: 'button', label: 'Replay', onClick: play },
    {
      type: 'button',
      label: 'Toggle weight swap',
      onClick: () => {
        weightSwap = !weightSwap;
        play();
      },
    },
  ]);

  note(
    'split',
    `Two tiers, which is the bit people miss. The <code>.line</code> wrapper carries
     <code>overflow: hidden</code> and each <code>.char</code> inside starts at
     <code>translateY(110%)</code>. The mask means characters rise out of nothing rather than fading in
     over the background.
     <br><br>Delay is per character, <code>--d: calc(index * stagger)</code>, so the line arrives as a
     wave. Mat Voyce runs about 318 of these split elements on one page.
     <br><br><strong>The weight swap.</strong> Their markup alternates <code>char isRegular</code> and
     <code>char isBold</code>. That is a discrete swap between two loaded weights, not variable font
     interpolation, which matters because you ship static Switzer 400, 500 and 700. So this technique
     needs no new font files. Characters fly in bold and settle to regular.
     <br><br>Caveat worth knowing: your reveal masks already sheared the credentials figure once. Any
     mask around display type needs the vertical padding, which is why the line here carries
     <code>padding-block: 0.06em</code>.`
  );
}

export function blurDemo() {
  const host = stage('blur');
  const scroller = document.createElement('div');
  scroller.className = 'br';
  const inner = document.createElement('div');
  inner.className = 'br__inner';
  const p = document.createElement('p');
  p.className = 'br__p';
  inner.appendChild(p);
  scroller.appendChild(inner);
  host.appendChild(scroller);

  const text =
    'Scroll this panel. Each word sharpens as it crosses the reading line and softens again once it passes. Nothing fades as a block, so the paragraph never arrives all at once.';

  const words = text.split(' ').map((w) => {
    const s = document.createElement('span');
    s.className = 'br__w';
    s.textContent = w;
    p.append(s, document.createTextNode(' '));
    return s;
  });

  let maxBlur = 7;
  let range = 150;

  const update = () => {
    const r = scroller.getBoundingClientRect();
    const line = r.top + r.height * 0.42;
    words.forEach((w) => {
      const wr = w.getBoundingClientRect();
      const d = Math.abs(wr.top + wr.height / 2 - line);
      const t = clamp(d / range, 0, 1);
      w.style.filter = `blur(${(t * maxBlur).toFixed(2)}px)`;
      w.style.opacity = (1 - t * 0.75).toFixed(3);
    });
  };

  scroller.addEventListener('scroll', update, { passive: true });
  requestAnimationFrame(update);

  controls(host, [
    { key: 'mb', label: 'max blur', min: 0, max: 16, step: 0.5, value: 7, onInput: (n) => { maxBlur = n; update(); } },
    { key: 'rg', label: 'falloff px', min: 40, max: 340, value: 150, onInput: (n) => { range = n; update(); } },
  ]);

  note(
    'blur',
    `Rauno Freiberg's blur reveal, the one Codrops rebuilt. Distance from a fixed reading line maps to
     <code>filter: blur()</code> and opacity per word. It reads as focus pulling, which is a far more
     specific gesture than the fade up you currently apply to every section.
     <br><br><strong>Honest cost.</strong> <code>filter</code> is not a compositor-only property the way
     transform and opacity are. Blurring dozens of elements every scroll frame will show up on a mid
     range laptop. Two mitigations: only run it on elements currently in view, and cap the word count.
     Your own performance rules already say use filter sparingly, so this is the one technique here that
     needs measuring before it ships.`
  );
}

export function weightDemo() {
  const host = stage('weight');
  const wrap = document.createElement('div');
  wrap.className = 'ww';
  const h = document.createElement('p');
  h.className = 'ww__h';
  wrap.appendChild(h);
  host.appendChild(wrap);

  const text = 'Move across this line and the letters thicken under the pointer.';
  const chars = [...text].map((ch) => {
    const s = document.createElement('span');
    s.className = 'ww__c';
    s.textContent = ch === ' ' ? ' ' : ch;
    h.appendChild(s);
    return s;
  });

  let radius = 110;
  let lift = 5;
  let px = -9999;
  let py = -9999;
  let boxes = [];

  const measure = () => {
    boxes = chars.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  };
  new ResizeObserver(measure).observe(host);
  window.addEventListener('scroll', measure, { passive: true });
  requestAnimationFrame(measure);

  wrap.addEventListener('pointermove', (e) => {
    px = e.clientX;
    py = e.clientY;
  });
  wrap.addEventListener('pointerleave', () => {
    px = -9999;
    py = -9999;
  });

  controls(host, [
    { key: 'r', label: 'radius', min: 30, max: 320, value: 110, onInput: (n) => (radius = n) },
    { key: 'l', label: 'lift px', min: 0, max: 18, value: 5, onInput: (n) => (lift = n) },
  ]);

  note(
    'weight',
    `Proximity to the pointer picks one of the three weights you already ship. Inside a third of the
     radius characters go to 700, inside two thirds to 500, otherwise 400, plus a small vertical lift so
     the wave is legible in motion.
     <br><br>Because the swap is discrete there is no interpolation and no variable font required. The
     transition is on <code>transform</code> only. Do not try to transition
     <code>font-weight</code> itself across static faces, it will jump rather than blend, and animating
     it would be a layout property anyway.
     <br><br>This is the demo most specific to your site. It is a typographic portfolio, so a mechanic
     that manipulates type carries meaning where a generic particle field would not.`
  );

  onFrame(() => {
    if (!boxes.length) return;
    chars.forEach((c, i) => {
      const b = boxes[i];
      if (!b) return;
      const d = Math.hypot(px - b.x, py - b.y);
      const t = clamp(1 - d / radius, 0, 1);
      const w = t > 0.66 ? 700 : t > 0.33 ? 500 : 400;
      if (c._w !== w) {
        c.style.fontWeight = String(w);
        c._w = w;
      }
      c.style.transform = `translateY(${(-t * lift).toFixed(2)}px)`;
    });
  });
}
