import { useEffect, useState } from 'react';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Types out syntax-highlighted code character by character.
 *
 * lines: Array<Array<{ text: string, type?: string, href?: string }>>
 * Returns { revealed, done, total } where `revealed` is the number of
 * characters currently visible across the flattened token stream.
 */
export function useCodeTyper(lines, { speed = 26, startDelay = 350 } = {}) {
  const total = lines.reduce(
    (sum, line) => sum + line.reduce((s, tok) => s + tok.text.length, 0),
    0
  );
  const [revealed, setRevealed] = useState(() =>
    prefersReducedMotion() ? total : 0
  );

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let count = 0;
    let id;
    const tick = () => {
      count += 1;
      setRevealed(count);
      if (count < total) {
        id = setTimeout(tick, speed);
      }
    };
    id = setTimeout(tick, startDelay);
    return () => clearTimeout(id);
    // Runs the intro once from mount; lines are static module data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { revealed, done: revealed >= total, total };
}
