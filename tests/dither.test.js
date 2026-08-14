import { describe, test, expect } from 'vitest';
import { BAYER_8, fieldAt, renderDither } from '../src/lib/dither.js';

describe('BAYER_8', () => {
  test('is 8x8', () => {
    expect(BAYER_8).toHaveLength(8);
    BAYER_8.forEach((row) => expect(row).toHaveLength(8));
  });

  test('holds 64 distinct thresholds in [0, 1)', () => {
    const values = BAYER_8.flat();
    expect(new Set(values).size).toBe(64);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });
});

describe('fieldAt', () => {
  test('stays within [0, 1] across the canvas and over time', () => {
    for (let t = 0; t < 20000; t += 2500) {
      for (let y = 0; y < 100; y += 10) {
        for (let x = 0; x < 160; x += 10) {
          const v = fieldAt(x, y, 160, 100, t);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  // A flat field dithers into a uniform checkerboard instead of a gradient,
  // which is the bug the squared falloff was introduced to fix.
  test('has real contrast rather than sitting flat near mid grey', () => {
    const samples = [];
    for (let y = 0; y < 100; y += 4) {
      for (let x = 0; x < 160; x += 4) samples.push(fieldAt(x, y, 160, 100, 0));
    }
    expect(Math.max(...samples)).toBeGreaterThan(0.85);
    expect(Math.min(...samples)).toBeLessThan(0.05);
  });
});

describe('renderDither', () => {
  test('writes the ink color and a binary alpha to every pixel', () => {
    const w = 16;
    const h = 8;
    const written = { data: new Uint8ClampedArray(w * h * 4) };

    const ctx = {
      createImageData: () => written,
      putImageData: () => {},
    };

    renderDither(ctx, w, h, 0, [255, 255, 255]);

    for (let i = 0; i < written.data.length; i += 4) {
      expect(written.data[i]).toBe(255);
      expect([0, 255]).toContain(written.data[i + 3]);
    }
  });
});
