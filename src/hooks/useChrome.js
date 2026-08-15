import { useEffect, useRef } from 'react';
import { createChrome } from '../lib/chrome';

const SCALE = 0.5; // render at half resolution, scale up smoothly
const MAX_PIXELS = 520000;
const FPS = 40;

/**
 * Drives the hero's chrome canvas.
 *
 * Half resolution keeps the per-frame cost sane: the shader evaluates the
 * distance field five times per pixel for the surface plus four more for the
 * normal, so full-resolution would be several million evaluations a frame.
 * Scaled up by CSS with normal smoothing, since this surface is meant to look
 * polished rather than pixelated.
 */
export function useChrome({ reducedMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chrome = createChrome(canvas);
    if (!chrome) return;

    const root = document.documentElement;
    let raf = 0;
    let last = 0;
    let visible = true;
    let intensity = 0;

    const draw = (seconds) => {
      const style = getComputedStyle(root);
      const mx = (parseFloat(style.getPropertyValue('--pnx')) || 0) * 0.5 + 0.5;
      const my = 1 - ((parseFloat(style.getPropertyValue('--pny')) || 0) * 0.5 + 0.5);
      chrome.render(seconds, mx, my, intensity);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      let w = Math.max(16, Math.round(rect.width * SCALE));
      let h = Math.max(16, Math.round(rect.height * SCALE));

      const pixels = w * h;
      if (pixels > MAX_PIXELS) {
        const k = Math.sqrt(MAX_PIXELS / pixels);
        w = Math.round(w * k);
        h = Math.round(h * k);
      }

      chrome.resize(w, h);
      draw(last / 1000);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    if (reducedMotion) {
      intensity = 1;
      draw(2.4);
      return () => {
        resizeObserver.disconnect();
        chrome.dispose();
      };
    }

    const interval = 1000 / FPS;

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (t - last < interval) return;
      last = t;
      intensity = Math.min(1, intensity + 0.025);
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
      chrome.dispose();
    };
  }, [reducedMotion]);

  return canvasRef;
}
