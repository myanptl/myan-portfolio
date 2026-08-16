import { useEffect, useRef } from 'react';

/**
 * Pulls an element toward the pointer while it is nearby, and lets it spring
 * back when the pointer leaves. Used on links and controls so nothing on the
 * page feels inert.
 *
 * Writes transforms directly rather than through React state, so hovering
 * costs no renders.
 */
export function useMagnetic({ strength = 0.32, radius = 90 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const frame = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;

      if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) {
        cx = tx;
        cy = ty;
        el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
        raf = 0;
        return;
      }

      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);

      if (distance > rect.width / 2 + radius) {
        tx = 0;
        ty = 0;
      } else {
        tx = dx * strength;
        ty = dy * strength;
      }
      start();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      start();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [strength, radius]);

  return ref;
}
