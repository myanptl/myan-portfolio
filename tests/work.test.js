import { describe, test, expect } from 'vitest';
import { workIndex } from '../src/data/work.js';
import { profile } from '../src/data/profile.js';

describe('work index', () => {
  test('every entry carries a name, a role, a destination and a link', () => {
    for (const item of workIndex) {
      expect(item.name?.trim(), 'missing name').toBeTruthy();
      expect(item.role?.trim(), `${item.name} has no role`).toBeTruthy();
      expect(item.at?.trim(), `${item.name} has no destination label`).toBeTruthy();
      expect(item.href, `${item.name} has no href`).toMatch(/^https:\/\//);
    }
  });

  // The whole point of the rewrite. A role is what the thing IS, not a pitch
  // for it, and the reference portfolios all land under six words.
  test('roles stay under seven words', () => {
    for (const item of workIndex) {
      expect(item.role.split(/\s+/).length, `${item.name}: "${item.role}"`).toBeLessThanOrEqual(6);
    }
  });

  test('names are unique', () => {
    const names = workIndex.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('profile', () => {
  test('says almost nothing', () => {
    const words = `${profile.lead} ${profile.now}`.split(/\s+/).length;
    expect(words).toBeLessThanOrEqual(40);
  });

  test('every link is https and labelled', () => {
    expect(profile.links.length).toBeGreaterThan(0);
    for (const link of profile.links) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(link.label.trim()).toBeTruthy();
    }
  });
});
