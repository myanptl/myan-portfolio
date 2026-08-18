import { useEffect, useRef } from 'react';
import { createSpring, createClock } from '../lib/spring';

/**
 * Pulls an element toward the pointer while it is nearby, and lets it spring
 * back when the pointer leaves. Used on links and controls so nothing on the
 * page feels inert.
 *
 * Writes transforms directly rather than through React state, so hovering
 * costs no renders.
 *
 * The return is deliberately underdamped, ratio around 0.75. Pull a link and
 * flick away and it whips past centre before settling, which is the difference
 * between a link that feels physical and one that feels animated.
 */
export function useMagnetic({ strength = 0.32, radius = 90, stiffness = 260, damping = 24 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const sx = createSpring({ stiffness, damping });
    const sy = createSpring({ stiffness, damping });
    const tick = createClock();
    let raf = 0;

    const frame = (now) => {
      const dt = tick(now);
      sx.step(dt);
      sy.step(dt);

      el.style.transform = `translate3d(${sx.value.toFixed(2)}px, ${sy.value.toFixed(2)}px, 0)`;

      // Stop the loop once it has genuinely come to rest, not merely got close.
      // Velocity has to be near zero too, or an overshooting spring parks
      // mid-flight.
      if (sx.settled(0.02) && sy.settled(0.02)) {
        raf = 0;
        return;
      }
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
        sx.target = 0;
        sy.target = 0;
      } else {
        sx.target = dx * strength;
        sy.target = dy * strength;
      }
      start();
    };

    const onLeave = () => {
      sx.target = 0;
      sy.target = 0;
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
  }, [strength, radius, stiffness, damping]);

  return ref;
}
