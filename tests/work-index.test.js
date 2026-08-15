import { describe, test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { workIndex, marqueeWords } from '../src/data/work.js';
import { projects } from '../src/data/profile.js';

describe('work index', () => {
  test('lists every project from profile.js exactly once', () => {
    const inIndex = workIndex.map((i) => i.name).sort();
    const inProfile = projects
      .map((p) => (p.name.startsWith('EquityLens') ? 'EquityLens' : p.name))
      .sort();
    expect(inIndex).toEqual(inProfile);
  });

  test('every entry carries a role and a year', () => {
    for (const item of workIndex) {
      expect(item.role, `${item.name} has no role`).toBeTruthy();
      // Roles are a short description of what the thing is, not a slogan.
      expect(item.role.split(' ').length).toBeLessThanOrEqual(6);
      expect(item.year).toMatch(/^\d{4}$/);
    }
  });

  test('every entry links out over https', () => {
    for (const item of workIndex) {
      expect(item.href, `${item.name} has no href`).toMatch(/^https:\/\//);
    }
  });

  // The hover preview loads /work/<media>-800.webp. A missing file would show
  // an empty frame beside the cursor.
  test('every preview capture exists', () => {
    for (const item of workIndex.filter((i) => i.media)) {
      const path = `public/work/${item.media}-800.webp`;
      expect(existsSync(path), `missing ${path}`).toBe(true);
    }
  });

  test('the marquee mirrors the index', () => {
    expect(marqueeWords).toHaveLength(workIndex.length);
  });

  // Em dashes are a recorded AI tell and are not used in copy written here.
  test('no em dashes in index copy', () => {
    for (const item of workIndex) {
      expect(`${item.name} ${item.role}`).not.toContain('—');
    }
  });
});
