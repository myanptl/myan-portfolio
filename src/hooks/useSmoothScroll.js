import { useEffect } from 'react';
import { createSmoothScroll } from '../lib/smoothScroll';
import { useReducedMotion } from './useReducedMotion';

/**
 * Installs lerped scrolling, and disables it entirely for anyone who has asked
 * for reduced motion or is on a touch device (where native momentum scrolling
 * is already better than anything intercepted wheel events can do).
 */
export function useSmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const scroller = createSmoothScroll();
    if (!scroller) return;

    // Anchor links need to go through the scroller, otherwise the native jump
    // fights the damping.
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      event.preventDefault();
      scroller.scrollTo(el.getBoundingClientRect().top + window.scrollY);
    };

    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      scroller.destroy();
    };
  }, [reducedMotion]);
}
