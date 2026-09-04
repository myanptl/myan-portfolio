import { useEffect } from 'react';
import Lenis from 'lenis';
import { onFrame } from '../lib/frame.js';
import { useReducedMotion } from './useReducedMotion';

/**
 * Lerped scrolling, driven from the shared frame loop.
 *
 * This matters more here than it does on an ordinary page: the camera is
 * sampled from scroll position every frame, and native wheel scrolling lands on
 * whatever pixel the browser picked that tick. On a trackpad that reads as
 * visible stepping in the 3D, not just as a less smooth page.
 *
 * Disabled for reduced motion, and on touch, where native momentum is already
 * better than anything intercepted wheel events can do.
 */
export function useSmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.9 });
    const stop = onFrame((_, now) => lenis.raf(now));

    // Dev-only handle. The scroller owns the scroll position, so without this
    // there is no way to drive the page to an exact offset from the console or
    // from a browser-automation session. Stripped from production builds.
    if (import.meta.env.DEV) window.__lenis = lenis;

    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link) return;
      const el = document.getElementById(link.getAttribute('href').slice(1));
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el);
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      stop();
      lenis.destroy();
    };
  }, [reducedMotion]);
}
