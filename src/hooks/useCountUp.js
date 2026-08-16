import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Counts from zero to `value` once, when told to start. Eases out so it lands
 * rather than stopping dead.
 */
export function useCountUp(value, start, duration = 1400) {
  const [display, setDisplay] = useState(0);
  const reducedMotion = useReducedMotion();
  const raf = useRef(0);

  useEffect(() => {
    if (!start) return;

    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let begin = 0;

    const step = (now) => {
      if (!begin) begin = now;
      const p = Math.min(1, (now - begin) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, start, duration, reducedMotion]);

  return display;
}
