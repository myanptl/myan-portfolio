import { useEffect, useState } from 'react';
import { marqueeWords } from '../../data/work';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './marquee.css';

const GLITCH = '▚▞█▓▒░/\\#§';

/** Swaps one character of one word every tick, so the strip never sits still. */
function useGlitch(words, enabled) {
  const [glitched, setGlitched] = useState(words);

  useEffect(() => {
    if (!enabled) {
      setGlitched(words);
      return;
    }

    const id = setInterval(() => {
      const w = Math.floor(Math.random() * words.length);
      const word = words[w];
      const c = Math.floor(Math.random() * word.length);
      const char = GLITCH[Math.floor(Math.random() * GLITCH.length)];

      setGlitched(
        words.map((original, i) =>
          i === w ? original.slice(0, c) + char + original.slice(c + 1) : original,
        ),
      );
    }, 220);

    return () => clearInterval(id);
  }, [words, enabled]);

  return glitched;
}

export function Marquee() {
  const reducedMotion = useReducedMotion();
  const words = useGlitch(marqueeWords, !reducedMotion);
  const strip = [...words, ...words];

  return (
    <section className="marquee" data-polarity="light" data-section="shipped">
      <div className="marquee__track" aria-hidden="true">
        {strip.map((word, i) => (
          <span key={`${word}-${i}`} className="marquee__word">
            {word}
            <i className="marquee__dot">/</i>
          </span>
        ))}
      </div>
      <p className="sr-only">
        Shipped: {marqueeWords.join(', ')}.
      </p>
    </section>
  );
}
