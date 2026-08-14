// Ordered (Bayer) dithering. Renders at low resolution and is scaled up by CSS
// with image-rendering: pixelated, which is what gives the halftone its bite
// and keeps the per-frame cost near zero.

/** Normalised 8x8 Bayer threshold matrix, values in [0, 1). */
export const BAYER_8 = (() => {
  const base = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
  ];
  return base.map((row) => row.map((v) => v / 64));
})();

/**
 * Field intensity at a point: two drifting radial lobes with a sharp falloff.
 *
 * The falloff matters. A broad, flat field sits near the middle of the Bayer
 * thresholds everywhere at once, which dithers into a uniform checkerboard
 * rather than a gradient. Squaring the lobes pushes most of the canvas to full
 * dark and leaves a real ramp only at the edges, which is what reads as
 * halftone.
 */
export function fieldAt(x, y, w, h, t) {
  const ax = w * (0.34 + 0.2 * Math.cos(t * 0.00021));
  const ay = h * (0.42 + 0.26 * Math.sin(t * 0.00017));
  const bx = w * (0.7 + 0.22 * Math.cos(t * 0.00013 + 2.1));
  const by = h * (0.6 + 0.2 * Math.sin(t * 0.00024 + 1.3));

  const r = Math.max(w, h) * 0.46;
  const da = Math.max(0, 1 - Math.hypot(x - ax, y - ay) / r);
  const db = Math.max(0, 1 - Math.hypot(x - bx, y - by) / r);

  // Squared lobes = tight cores, fast falloff, visible dither ramp.
  return Math.min(1, da * da * 1.15 + db * db * 0.9);
}

/**
 * Paints one dithered frame of the field into ctx at the canvas's own
 * (low) resolution. `rgb` is the ink color as [r, g, b].
 */
export function renderDither(ctx, w, h, t, rgb) {
  const image = ctx.createImageData(w, h);
  const px = image.data;
  const [r, g, b] = rgb;

  for (let y = 0; y < h; y += 1) {
    const row = BAYER_8[y & 7];
    for (let x = 0; x < w; x += 1) {
      const lit = fieldAt(x, y, w, h, t) > row[x & 7] ? 1 : 0;
      const i = (y * w + x) * 4;
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = lit * 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}
