import { describe, test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { takeovers, workA, workB, workC, workD, marqueeWords } from '../src/data/work.js';
import { projects } from '../src/data/profile.js';

const grids = [workA, workB, workC, workD];
const gridItems = grids.flat();
const allItems = [...takeovers, ...gridItems];
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

  // Every grid row is two cards wide, so an odd grid would leave a gap.
  test('each grid holds exactly two items', () => {
    grids.forEach((grid) => expect(grid).toHaveLength(2));
  });

  // The design rests on real captures, so a missing file is a real bug: it
  // would leave a blank panel where a product should be.
  test('every grid capture exists at both widths in both formats', () => {
    for (const item of gridItems.filter((i) => !i.textOnly)) {
      for (const width of [800, 1440]) {
        for (const ext of ['avif', 'webp']) {
          const path = `public/work/${item.media}-${width}.${ext}`;
          expect(existsSync(path), `missing ${path}`).toBe(true);
        }
      }
    }
  });

  test('every takeover has a full-page capture in both formats', () => {
    for (const item of takeovers) {
      for (const ext of ['avif', 'webp']) {
        const path = `public/work/${item.media}-full.${ext}`;
        expect(existsSync(path), `missing ${path}`).toBe(true);
      }
    }
  });

  test('every capture has descriptive alt text, not a filename', () => {
    for (const item of withMedia) {
      expect(item.alt, `${item.name} has no alt`).toBeTruthy();
      expect(item.alt.trim()).not.toBe(item.media);
      expect(item.alt.split(' ').length).toBeGreaterThan(6);
    }
  });

  test('every entry carries the category and year the layout renders', () => {
    for (const item of allItems) {
      expect(item.category, `${item.name} has no category`).toBeTruthy();
      expect(item.year, `${item.name} has no year`).toMatch(/^\d{4}(\.\d{2})?$/);
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

  test('takeovers carry the stat line and meta the layout renders', () => {
    for (const item of takeovers) {
      expect(item.stat).toBeTruthy();
      expect(item.meta.length).toBeGreaterThanOrEqual(2);
    }
  });

  // Copy rule: em dashes are a recorded AI tell and are not used in new copy.
  test('no em dashes in any work copy', () => {
    for (const item of allItems) {
      const copy = [item.line, item.alt, item.note, item.stat].filter(Boolean).join(' ');
      expect(copy, `${item.name} contains an em dash`).not.toContain('—');
    }
  });
});
