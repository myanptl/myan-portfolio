import { useEffect } from 'react';

/**
 * Publishes the pointer position to the document as CSS custom properties, and
 * pushes the numeric readout straight into a DOM node.
 *
 * Deliberately does not use React state. At 60fps a state update per frame
 * would re-render the whole tree continuously; custom properties let CSS react
 * to the pointer with no React work at all.
 *
 * Sets on <html>:
 *   --px, --py   pointer position in px
 *   --pnx, --pny normalised to -1..1 from the viewport centre
 *
 * `readoutRef` optionally receives the "0720 X 0450 Y" text.
 */
export function usePointer(readoutRef) {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const root = document.documentElement;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    // Eased values, so everything driven by the pointer trails it slightly.
    let ex = x;
    let ey = y;
    let raf = 0;
    let dirty = true;

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      dirty = true;
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!dirty && Math.abs(ex - x) < 0.1 && Math.abs(ey - y) < 0.1) return;

      ex += (x - ex) * 0.14;
      ey += (y - ey) * 0.14;
      dirty = false;

      root.style.setProperty('--px', `${ex.toFixed(1)}px`);
      root.style.setProperty('--py', `${ey.toFixed(1)}px`);
      root.style.setProperty('--pnx', ((ex / window.innerWidth) * 2 - 1).toFixed(4));
      root.style.setProperty('--pny', ((ey / window.innerHeight) * 2 - 1).toFixed(4));

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
