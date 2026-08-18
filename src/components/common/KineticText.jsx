import { useEffect, useRef, useState } from 'react';
import './kinetic.css';

/**
 * Display type split two ways: a line mask, and characters inside it.
 *
 * The line wrapper carries overflow: hidden and each character starts below
 * it, so letters rise out of nothing instead of fading in over the ground. The
 * per-character delay makes a line arrive as a wave rather than a block.
 *
 * Characters fly in at 700 and settle to 400. That is a discrete swap between
 * two loaded weights, not variable-font interpolation, which matters because
 * the site ships static Switzer at 400, 500 and 700. No new font files.
 *
 * Two traps this has to respect:
 *   - The chrome gradient paints on the innermost spans. An overflow: hidden
 *     ancestor establishes its own painting context and stops background-clip:
 *     text from ever reaching the glyphs, so .kinetic__char is in the chrome
 *     selector list in tokens.css and the mask must never be the painted node.
 *   - Masks around display type need vertical padding. Tight line-heights put
 *     ascenders and descenders outside the line box, and a mask sized to the
 *     box alone shears the tops and tails off letters. This is what once cut
 *     the top off the credentials figure.
 */
export function KineticText({
  lines = [],
  className = '',
  delay = 0,
  stagger = 26,
  weightSwap = true,
  wave = true,
  reducedMotion = false,
}) {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);

  // Flat index across every line, so the stagger runs continuously through the
  // whole headline rather than restarting on each line.
  let index = 0;
  const built = lines.map((line) =>
    line.split(' ').map((word) => ({
      word,
      chars: [...word].map((ch) => ({ ch, i: index++ })),
    }))
  );
  const total = index;

  useEffect(() => {
    if (reducedMotion) {
      setEntered(true);
      return;
    }
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  // Characters settle from bold back to regular once their own flight is over.
  useEffect(() => {
    if (!entered || !weightSwap || reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const chars = Array.from(el.querySelectorAll('.kinetic__char'));
    const timers = chars.map((c, i) =>
      setTimeout(() => c.classList.remove('is-heavy'), delay + i * stagger + 640)
    );
    return () => timers.forEach(clearTimeout);
  }, [entered, weightSwap, reducedMotion, delay, stagger]);

  // Weight wave. Proximity to the pointer picks one of the three loaded
  // weights and lifts the character slightly.
  useEffect(() => {
    if (!wave || reducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;

    const chars = Array.from(el.querySelectorAll('.kinetic__char'));
    let boxes = [];
    let px = -9999;
    let py = -9999;
    let raf = 0;
    let dirty = false;

    const measure = () => {
      boxes = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const frame = () => {
      raf = 0;
      if (!dirty) return;
      dirty = false;
      const radius = 150;
      chars.forEach((c, i) => {
        const b = boxes[i];
        if (!b) return;
        const t = Math.max(0, Math.min(1, 1 - Math.hypot(px - b.x, py - b.y) / radius));
        const w = t > 0.66 ? 700 : t > 0.33 ? 500 : 400;
        if (c._w !== w) {
          c.style.fontWeight = String(w);
          c._w = w;
        }
        c.style.setProperty('--lift', `${(-t * 6).toFixed(2)}px`);
      });
    };

    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      dirty = true;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    measure();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', measure);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [wave, reducedMotion, total]);

  return (
    <span
      ref={ref}
      className={`kinetic ${entered ? 'is-in' : ''} ${className}`}
      style={{ '--stagger': `${stagger}ms`, '--delay': `${delay}ms` }}
    >
      {built.map((words, li) => (
        <span className="kinetic__line" key={li}>
          {words.map(({ word, chars }, wi) => (
            <span className="kinetic__word" key={`${word}-${wi}`}>
              {chars.map(({ ch, i }) => (
                <span
                  key={i}
                  className={`kinetic__char ${weightSwap && !reducedMotion ? 'is-heavy' : ''}`}
                  style={{ '--i': i }}
                >
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
