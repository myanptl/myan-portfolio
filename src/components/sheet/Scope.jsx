import { useEffect, useRef } from 'react';
import { subscribeTheme } from '../../lib/theme';

// Figure 1. A storage oscilloscope screen. Every probe result arrives as a
// pulse whose height is its round-trip time; the trace scrolls right to left
// at 3 s/div. Drawn straight to a canvas: React never re-renders per frame.

const DIV_X = 10;
const DIV_Y = 8;
const MS_PER_DIV = 125;            // so the screen spans 0 to 1000 ms
const PULSE_MS = 260;              // half-width of each pulse in screen time
const BASELINE = 10;               // px above the bottom edge, where 0 ms sits
const LABEL_GAP = 8;               // px between neighbouring labels

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function Scope({ bus }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const blips = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let colors = {};
    let secondsPerDiv = 3;          // halved on narrow screens so replies do not pile up
    let windowMs = 30000;

    const readColors = () => {
      colors = { screen: css('--screen'), grid: css('--screen-grid'), axis: css('--screen-axis'), trace: css('--phosphor'), text: css('--screen-text') };
    };

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      w = r.width;
      h = r.height;
      secondsPerDiv = w < 600 ? 1.5 : 3;
      windowMs = DIV_X * secondsPerDiv * 1000;
    };

    const yFor = (ms) => h - BASELINE - Math.min(ms, MS_PER_DIV * DIV_Y) / (MS_PER_DIV * DIV_Y) * (h - BASELINE);

    const graticule = () => {
      ctx.fillStyle = colors.screen;
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      for (let i = 1; i < DIV_X; i++) { const x = Math.round(i * w / DIV_X) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let j = 1; j < DIV_Y; j++) { const y = Math.round(j * h / DIV_Y) + 0.5; ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      // Minor ticks on the centre axes, five per division, like a real scope.
      ctx.strokeStyle = colors.axis;
      ctx.beginPath();
      const cx = Math.round(w / 2) + 0.5;
      const cy = Math.round(h / 2) + 0.5;
      for (let i = 0; i <= DIV_X * 5; i++) { const x = Math.round(i * w / (DIV_X * 5)) + 0.5; ctx.moveTo(x, cy - 3); ctx.lineTo(x, cy + 3); }
      for (let j = 0; j <= DIV_Y * 5; j++) { const y = Math.round(j * h / (DIV_Y * 5)) + 0.5; ctx.moveTo(cx - 3, y); ctx.lineTo(cx + 3, y); }
      ctx.stroke();
    };

    const draw = (now) => {
      graticule();
      const t0 = now - windowMs;
      while (blips.length && blips[0].t < t0 - PULSE_MS * 2) blips.shift();
      const xFor = (t) => (t - t0) / windowMs * w;

      // The trace: a baseline with a raised-cosine pulse at each reply.
      ctx.strokeStyle = colors.trace;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = colors.trace;
      ctx.shadowBlur = 6; // phosphor bloom, kept tight
      ctx.beginPath();
      for (let x = 0; x <= w; x += 1) {
        const t = t0 + x / w * windowMs;
        let ms = 0;
        for (const b of blips) {
          const d = Math.abs(t - b.t);
          if (d < PULSE_MS && b.ms) ms = Math.max(ms, b.ms * 0.5 * (1 + Math.cos(Math.PI * d / PULSE_MS)));
        }
        const y = yFor(ms);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Each reply names itself just above its peak. If that spot is taken,
      // try one line higher; if both are taken, leave this pulse unlabelled.
      ctx.font = '11px "Departure Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = colors.text;
      const placed = [];
      const free = (l, r, y) => placed.every((p) => r + LABEL_GAP < p.l || l - LABEL_GAP > p.r || Math.abs(y - p.y) >= 13);
      for (const b of blips) {
        const x = xFor(b.t);
        if (x < -60 || x > w + 60) continue;
        const text = b.ms ? `${b.name} ${b.ms}` : `${b.name} timeout`;
        const half = ctx.measureText(text).width / 2;
        const base = b.ms ? yFor(b.ms) - 8 : h - BASELINE - 6;
        const y = [base, base - 13].find((c) => c > 30 && free(x - half, x + half, c));
        if (y === undefined) continue;
        ctx.fillText(text, x, y);
        placed.push({ l: x - half, r: x + half, y });
      }

      // Scale readings, as the instrument prints them.
      ctx.textAlign = 'left';
      ctx.fillText(`${MS_PER_DIV} ms/div`, 8, 16);
      ctx.textAlign = 'right';
      ctx.fillText(`${secondsPerDiv} s/div`, w - 8, 16);
    };

    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };

    const offBlip = bus.on((blip) => {
      blips.push(blip);
      if (still) draw(performance.now());
    });
    const ro = new ResizeObserver(() => { size(); draw(performance.now()); });
    ro.observe(canvas);
    const offTheme = subscribeTheme(() => { readColors(); draw(performance.now()); });
    readColors();
    size();
    if (!still) raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); offTheme(); offBlip(); };
  }, [bus]);

  return <canvas ref={canvasRef} className="scope" role="img" aria-label="Live round-trip times from your browser to each deployed app" />;
}
