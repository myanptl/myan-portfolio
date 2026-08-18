import { useEffect } from 'react';
import { renderAscii } from '../lib/dither';

// Character cell size in CSS pixels. The field is drawn as text, so this is a
// font size rather than a pixel grid, and the canvas runs at full resolution.
//
// 11px is small enough to read as texture from a normal viewing distance and
// large enough that the characters are still identifiable as characters up
// close, which is the point of doing it this way at all.
const CELL = 11;

// Text rendering is far more expensive per cell than putImageData, so this
// runs slower. The gyroid drifts at a speed where 6fps is not perceptible.
const FPS = 6;

/**
 * Gives every section a character field instead of a blurred radial glow.
 *
 * A drifting gyroid slice, quantised to a density ramp and drawn in the mono
 * face the site already loads, in the section's own foreground colour at low
 * opacity. It does the job the radial aura did, stopping sections from reading
 * as flat panels, without being a glow blob.
 *
 * Two references drove this: fluid.krackeddevs.com for the field function, and
 * ascii.krackeddevs.com for rendering a field through characters. Neither
 * contributed any file. The gyroid is standard maths and the ramp is ten
 * ASCII characters.
 *
 * Kept deliberately faint. At full strength this is a terminal, and a fake
 * terminal is its own signature. At 7% it is a texture.
 *
 * Attaches canvases directly rather than exposing a component, so this does not
 * require editing all seven section files to add a decorative element. Every
 * canvas is aria-hidden and pointer-events: none.
 *
 * Only sections in view animate, and the whole thing runs at 12fps because the
 * field drifts slowly. Off-screen sections cost nothing.
 */
export function useDitherFields({ reducedMotion } = {}) {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll('section[data-polarity]:not(.hero)')
    );
    if (sections.length === 0) return;

    const root = document.documentElement;
    const fields = [];

    sections.forEach((section) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'field';
      canvas.setAttribute('aria-hidden', 'true');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      section.prepend(canvas);
      fields.push({ section, canvas, ctx, w: 0, h: 0, rgb: [255, 255, 255], visible: false });
    });

    if (fields.length === 0) return;

    const measure = (f) => {
      const rect = f.section.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Full resolution, capped so a very tall section cannot allocate an
      // enormous backing store.
      const w = Math.round(rect.width);
      const h = Math.min(2600, Math.round(rect.height));
      if (w !== f.w || h !== f.h) {
        f.w = w;
        f.h = h;
        f.canvas.width = w;
        f.canvas.height = h;
      }
      // The field paints in the section's own type colour, so it stays correct
      // through every polarity and tone change without being told about them.
      const fg = getComputedStyle(f.section).getPropertyValue('--fg-rgb').trim();
      const parts = fg.split(',').map((n) => parseInt(n, 10));
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) f.rgb = parts;
    };

    fields.forEach(measure);

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const f = fields.find((x) => x.section === entry.target);
        if (f) measure(f);
      });
    });
    fields.forEach((f) => resizeObserver.observe(f.section));

    const inView = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const f = fields.find((x) => x.section === entry.target);
        if (f) f.visible = entry.isIntersecting;
      });
    });
    fields.forEach((f) => inView.observe(f.section));

    const paint = (f, t, px, py) => {
      if (f.w === 0 || f.h === 0) return;
      renderAscii(f.ctx, f.w, f.h, CELL, t, f.rgb, { x: px, y: py });
    };

    if (reducedMotion) {
      fields.forEach((f) => paint(f, 0, 0, 0));
      return () => {
        resizeObserver.disconnect();
        inView.disconnect();
        fields.forEach((f) => f.canvas.remove());
      };
    }

    let raf = 0;
    let last = 0;
    const interval = 1000 / FPS;

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (t - last < interval) return;
      last = t;
      const style = getComputedStyle(root);
      const px = parseFloat(style.getPropertyValue('--pnx')) || 0;
      const py = parseFloat(style.getPropertyValue('--pny')) || 0;
      fields.forEach((f) => {
        if (f.visible) paint(f, t, px, py);
      });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      inView.disconnect();
      fields.forEach((f) => f.canvas.remove());
    };
  }, [reducedMotion]);
}
