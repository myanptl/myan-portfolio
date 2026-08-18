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
export function fieldAt(x, y, w, h, t, pointer = { x: 0, y: 0 }) {
  // The first lobe is pulled toward the pointer, so the field opens up around
  // the cursor instead of just drifting on a timer.
  const ax = w * (0.34 + 0.2 * Math.cos(t * 0.00021) + pointer.x * 0.22);
  const ay = h * (0.42 + 0.26 * Math.sin(t * 0.00017) + pointer.y * 0.24);
  const bx = w * (0.7 + 0.22 * Math.cos(t * 0.00013 + 2.1) - pointer.x * 0.1);
  const by = h * (0.6 + 0.2 * Math.sin(t * 0.00024 + 1.3) - pointer.y * 0.1);

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
export function renderDither(ctx, w, h, t, rgb, pointer) {
  const image = ctx.createImageData(w, h);
  const px = image.data;
  const [r, g, b] = rgb;

  for (let y = 0; y < h; y += 1) {
    const row = BAYER_8[y & 7];
    for (let x = 0; x < w; x += 1) {
      const lit = fieldAt(x, y, w, h, t, pointer) > row[x & 7] ? 1 : 0;
      const i = (y * w + x) * 4;
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = lit * 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}

/**
 * Gyroid slice.
 *
 * The two-lobe field above is soft and shapeless, which is fine as a
 * replacement for a glow but has no structure of its own. A gyroid is a
 * triply-periodic minimal surface: sampling one moving 2D slice of it gives
 * continuous woven bands that never repeat visibly and never resolve into a
 * blob.
 *
 * Adapted from the layer vocabulary on fluid.krackeddevs.com (gyroid, truchet,
 * cellular, interference). The function is standard maths rather than anything
 * taken from that site.
 */
export function gyroidAt(x, y, w, h, t, pointer = { x: 0, y: 0 }) {
  // Normalised, aspect-corrected, and drifting with both time and the pointer.
  const s = 6.2;
  const nx = (x / w - 0.5) * s + pointer.x * 0.5;
  const ny = (y / h - 0.5) * s * (h / w) + pointer.y * 0.4;
  const nz = t * 0.00008;

  const g =
    Math.sin(nx) * Math.cos(ny) +
    Math.sin(ny) * Math.cos(nz) +
    Math.sin(nz) * Math.cos(nx);

  // g lands in about -2..2. Fold it to 0..1 and bias so most of the canvas is
  // empty, leaving the bands as the only lit region.
  const v = 1 - Math.min(1, Math.abs(g) * 0.85);
  return v * v;
}

/** Density ramp, sparse to dense. Rendered in the mono face the site loads. */
export const ASCII_RAMP = ' .:-=+*#%@';

/**
 * Paints the field as characters rather than as thresholded pixels.
 *
 * Cells are addressed in device pixels and drawn with fillText, so this canvas
 * is full resolution and must NOT carry image-rendering: pixelated. It is the
 * one place on the site where the mono face is doing something other than
 * labelling.
 */
export function renderAscii(ctx, w, h, cell, t, rgb, pointer, alpha = 1) {
  ctx.clearRect(0, 0, w, h);
  ctx.font = `${cell}px 'IBM Plex Mono', ui-monospace, monospace`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;

  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / (cell * 1.6));
  const last = ASCII_RAMP.length - 1;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const v = gyroidAt(c * cell, r * cell * 1.6, w, h, t, pointer);
      const ch = ASCII_RAMP[Math.min(last, Math.round(v * last))];
      if (ch === ' ') continue;
      ctx.fillText(ch, c * cell, r * cell * 1.6);
    }
  }
}
