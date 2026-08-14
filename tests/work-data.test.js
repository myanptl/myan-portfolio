import { describe, test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { takeovers, pairs, marqueeWords } from '../src/data/work.js';
import { projects } from '../src/data/profile.js';

const allItems = [...takeovers, ...pairs.flatMap((p) => p.items)];
const withMedia = allItems.filter((item) => !item.textOnly);

describe('work data', () => {
  test('every project in profile.js appears once in the work sequence', () => {
    const namesInWork = allItems.map((i) => i.name).sort();
    const namesInProfile = projects
      .map((p) => (p.name.startsWith('EquityLens') ? 'EquityLens' : p.name))
      .sort();

    expect(namesInWork).toEqual(namesInProfile);
  });

  test('no project is shown twice', () => {
    const names = allItems.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
  });

  // The whole design rests on real captures, so a missing file is a real bug:
  // it would leave a blank panel where a product should be.
  test('every referenced capture exists at both widths in both formats', () => {
    for (const item of withMedia) {
      for (const width of [800, 1440]) {
        for (const ext of ['avif', 'webp']) {
          const path = `public/work/${item.media}-${width}.${ext}`;
          expect(existsSync(path), `missing ${path}`).toBe(true);
        }
      }
    }
  });

  test('every capture has descriptive alt text, not a filename', () => {
    for (const item of withMedia) {
      expect(item.alt, `${item.name} has no alt`).toBeTruthy();
      expect(item.alt.length).toBeGreaterThan(20);
      // A product name inside the sentence is fine; the alt just must not BE
      // the filename, and must read as prose.
      expect(item.alt.trim()).not.toBe(item.media);
      expect(item.alt.split(' ').length).toBeGreaterThan(6);
    }
  });

  test('every entry links out over https', () => {
    for (const item of allItems) {
      expect(item.href, `${item.name} has no href`).toMatch(/^https:\/\//);
    }
  });

  test('the marquee lists every shipped project', () => {
    expect(marqueeWords).toHaveLength(projects.length);
  });

  test('takeovers carry the stat line the layout renders', () => {
    for (const item of takeovers) {
      expect(item.stat).toBeTruthy();
      expect(item.meta.length).toBeGreaterThan(0);
    }
  });
});
