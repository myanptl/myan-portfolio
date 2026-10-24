import { useEffect, useRef } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#<>_';
const STEP_MS = 32;
const SPAN = 14; // frames each letter spends scrambling before it settles

// The text decodes left to right once, on load. It writes straight to the DOM
// so the effect never re-renders React. Screen readers get the real text.
export function Scramble({ text, as: Tag = 'span', className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      el.textContent = [...text]
        .map((ch, i) => {
          if (ch === ' ' || frame >= i * 2 + SPAN) return ch;
          if (frame < i * 2) return ' ';
          return GLYPHS[(Math.random() * GLYPHS.length) | 0];
        })
        .join('');
      if (frame >= text.length * 2 + SPAN) {
        el.textContent = text;
        clearInterval(id);
      }
    }, STEP_MS);
    return () => { clearInterval(id); el.textContent = text; };
  }, [text]);

  return (
    <Tag className={className} aria-label={text}>
      <span ref={ref} aria-hidden="true">{text}</span>
    </Tag>
  );
}
