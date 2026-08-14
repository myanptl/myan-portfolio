import { useEffect, useRef } from 'react';
import { renderDither } from '../lib/dither';

const DOT = 8.5; // rendered size of one dither cell, in CSS pixels
const MAX_CELLS = 40000; // ceiling on per-frame work
const FPS = 20;

/**
 * Drives the hero's halftone canvas.
 *
 * The buffer is sized from the element's own aspect ratio rather than a fixed
 * resolution. A fixed 16:10 buffer stretched into vertical streaks on portrait
 * phones, because the canvas was being scaled non-uniformly.
 *
 * Paints one static frame under reduced motion, and otherwise runs a throttled
 * loop that pauses when the tab is hidden or the canvas is offscreen.
 */
export function useHalftone({ reducedMotion, rgb = [255, 255, 255] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    let visible = true;
    const interval = 1000 / FPS;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      let w = Math.max(8, Math.round(width / DOT));
      let h = Math.max(8, Math.round(height / DOT));

      // Keep the per-frame pixel count bounded on very large viewports.
      const cells = w * h;
      if (cells > MAX_CELLS) {
        const k = Math.sqrt(MAX_CELLS / cells);
        w = Math.max(8, Math.round(w * k));
        h = Math.max(8, Math.round(h * k));
      }

      canvas.width = w;
      canvas.height = h;
      renderDither(ctx, w, h, last, rgb);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    if (reducedMotion) {
      return () => resizeObserver.disconnect();
    }

    // Read the pointer from the custom properties usePointer publishes, rather
    // than subscribing separately. One source of truth, no extra listener.
    const root = document.documentElement;
    const pointer = { x: 0, y: 0 };

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (t - last < interval) return;
      last = t;

      const style = getComputedStyle(root);
      pointer.x = parseFloat(style.getPropertyValue('--pnx')) || 0;
      pointer.y = parseFloat(style.getPropertyValue('--pny')) || 0;

      renderDither(ctx, canvas.width, canvas.height, t, rgb, pointer);
    };

    const inView = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    inView.observe(canvas);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      inView.disconnect();
      resizeObserver.disconnect();
    };
  }, [reducedMotion, rgb]);

  return canvasRef;
}
