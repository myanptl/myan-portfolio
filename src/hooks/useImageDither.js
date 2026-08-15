import { useEffect, useRef } from 'react';
import { BAYER_8 } from '../lib/dither';

const WIDTH = 190; // dither resolution; CSS scales it up with pixelated

/**
 * Paints a one-bit ordered-dither version of an image into a canvas.
 *
 * Work captures render dithered by default and resolve to full colour on
 * hover, which keeps the grid in the same visual language as the hero and
 * makes colour something you uncover rather than something that is just there.
 *
 * Runs once per image. Same-origin sources only, so the canvas is never
 * tainted by the getImageData call.
 */
export function useImageDither(src) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    let cancelled = false;
    const image = new Image();
    image.decoding = 'async';
    image.src = src;

    const paint = () => {
      if (cancelled) return;

      const ratio = image.naturalHeight / image.naturalWidth || 0.625;
      const w = WIDTH;
      const h = Math.max(1, Math.round(WIDTH * ratio));

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(image, 0, 0, w, h);

      const frame = ctx.getImageData(0, 0, w, h);
      const px = frame.data;

      for (let y = 0; y < h; y += 1) {
        const row = BAYER_8[y & 7];
        for (let x = 0; x < w; x += 1) {
          const i = (y * w + x) * 4;
          // Rec. 601 luma, then a black crush. Without the crush, near-black UI
          // screenshots still cross the lowest Bayer thresholds and the whole
          // card fills with an even dot texture that hides the product.
          const luma =
            (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
          const level = Math.min(1, Math.max(0, (luma - 0.1) * 1.5));
          const lit = level > row[x & 7] ? 255 : 0;
          px[i] = lit;
          px[i + 1] = lit;
          px[i + 2] = lit;
          px[i + 3] = 255;
        }
      }

      ctx.putImageData(frame, 0, 0);
      canvas.dataset.ready = 'true';
    };

    if (image.complete && image.naturalWidth > 0) {
      paint();
    } else {
      image.addEventListener('load', paint, { once: true });
    }

    return () => {
      cancelled = true;
      image.removeEventListener('load', paint);
    };
  }, [src]);

  return canvasRef;
}
