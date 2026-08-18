import { useEffect } from 'react';
import { createSpring, createClock } from '../lib/spring';

/**
 * Publishes the pointer position to the document as CSS custom properties, and
 * pushes the numeric readout straight into a DOM node.
 *
 * Deliberately does not use React state. At 60fps a state update per frame
 * would re-render the whole tree continuously; custom properties let CSS react
 * to the pointer with no React work at all.
 *
 * Sets on <html>:
 *   --px, --py     pointer position in px
 *   --pnx, --pny   normalised to -1..1 from the viewport centre
 *   --pvx, --pvy   pointer velocity, for anything that wants direction
 *   --pspeed       velocity magnitude, clamped to 0..1
 *   --pangle       direction of travel in deg, held steady when nearly still
 *
 * The eased values come off a spring rather than a lerp, so everything that
 * trails the pointer now arrives with momentum and settles, and behaves the
 * same on a 60Hz and a 120Hz display. See src/lib/spring.js.
 */
export function usePointer(readoutRef) {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const root = document.documentElement;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    let x = startX;
    let y = startY;

    // Slightly underdamped: the trail overshoots a little on a fast flick,
    // which is what stops it feeling like a lagging copy of the cursor.
    const sx = createSpring({ stiffness: 210, damping: 24, value: startX });
    const sy = createSpring({ stiffness: 210, damping: 24, value: startY });
    const tick = createClock();

    let raf = 0;
    // Held between frames. Below the speed threshold the direction of a nearly
    // stationary pointer is noise, and writing it would make anything aligned
    // to it spin on the spot.
    let angle = 0;

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = tick(now);

      sx.target = x;
      sy.target = y;

      const idle = sx.settled(0.05) && sy.settled(0.05);
      if (idle) return;

      sx.step(dt);
      sy.step(dt);

      const ex = sx.value;
      const ey = sy.value;

      root.style.setProperty('--px', `${ex.toFixed(1)}px`);
      root.style.setProperty('--py', `${ey.toFixed(1)}px`);
      root.style.setProperty('--pnx', ((ex / window.innerWidth) * 2 - 1).toFixed(4));
      root.style.setProperty('--pny', ((ey / window.innerHeight) * 2 - 1).toFixed(4));

      // Velocity falls out of the spring for free. Anything that wants to lean
      // into the direction of travel can read these without tracking deltas.
      const vx = sx.velocity;
      const vy = sy.velocity;
      const speed = Math.hypot(vx, vy);
      if (speed > 90) angle = (Math.atan2(vy, vx) * 180) / Math.PI;

      root.style.setProperty('--pvx', vx.toFixed(2));
      root.style.setProperty('--pvy', vy.toFixed(2));
      root.style.setProperty('--pspeed', Math.min(1, speed / 2200).toFixed(4));
      root.style.setProperty('--pangle', `${angle.toFixed(2)}deg`);

      if (readoutRef?.current) {
        const px = String(Math.round(x)).padStart(4, '0');
        const py = String(Math.round(y)).padStart(4, '0');
        readoutRef.current.textContent = `${px} X ${py} Y`;
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [readoutRef]);
}
