import { useEffect, useRef } from 'react';
import { createLiquidMetal } from '../lib/liquidMetal';
import { renderDither } from '../lib/dither';

const CELL = 6.5; // rendered size of one dither cell, in CSS pixels
const MAX_CELLS = 90000;
const FPS = 30;

/**
 * Drives the hero's liquid-metal canvas.
 *
 * Renders at roughly one pixel per dither cell and lets CSS scale it up, so
 * the shader runs over a few tens of thousands of pixels rather than millions.
 *
 * Falls back to the 2D bayer field if WebGL is unavailable, and paints a single
 * static frame under reduced motion.
 */
export function useLiquidMetal({ reducedMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const metal = createLiquidMetal(canvas);
    const ctx2d = metal ? null : canvas.getContext('2d');
    if (!metal && !ctx2d) return;

    const root = document.documentElement;
    let raf = 0;
    let last = 0;
    let visible = true;
    let width = 0;
    let height = 0;
    // Eases in on first paint so the field arrives rather than popping.
    let intensity = 0;

    const draw = (seconds) => {
      const style = getComputedStyle(root);
      // Normalised pointer, remapped from the -1..1 that usePointer publishes.
      const mx = (parseFloat(style.getPropertyValue('--pnx')) || 0) * 0.5 + 0.5;
      const my = 1 - ((parseFloat(style.getPropertyValue('--pny')) || 0) * 0.5 + 0.5);

      if (metal) {
        metal.render(seconds, mx, my, intensity);
      } else {
        renderDither(ctx2d, width, height, seconds * 1000, [255, 255, 255], {
          x: mx * 2 - 1,
          y: my * 2 - 1,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      let w = Math.max(8, Math.round(rect.width / CELL));
      let h = Math.max(8, Math.round(rect.height / CELL));

      const cells = w * h;
      if (cells > MAX_CELLS) {
        const k = Math.sqrt(MAX_CELLS / cells);
        w = Math.max(8, Math.round(w * k));
        h = Math.max(8, Math.round(h * k));
      }

      width = w;
      height = h;

      if (metal) {
        metal.resize(w, h);
      } else {
        canvas.width = w;
        canvas.height = h;
      }
      draw(last);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    if (reducedMotion) {
      intensity = 1;
      draw(0);
      return () => {
        resizeObserver.disconnect();
        metal?.dispose();
      };
    }

    const interval = 1000 / FPS;

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (t - last < interval) return;
      last = t;
      intensity = Math.min(1, intensity + 0.03);
      draw(t / 1000);
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
      metal?.dispose();
    };
  }, [reducedMotion]);

  return canvasRef;
}
