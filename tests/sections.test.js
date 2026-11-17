import { describe, expect, it } from 'vitest';
import { sectionFromHash, sections } from '../src/data/sections';

describe('sectionFromHash', () => {
  it('maps a page hash to its section', () => {
    expect(sectionFromHash('#/projects').title).toBe('Projects');
    expect(sectionFromHash('#experience').title).toBe('Experience');
    expect(sectionFromHash('#/MOTION').title).toBe('Motion');
  });

  it('returns null for home and unknown hashes', () => {
    for (const h of ['', '#', '#/', '#/nope']) expect(sectionFromHash(h)).toBeNull();
  });

  it('gives every section rows and a unique slug', () => {
    expect(new Set(sections.map((s) => s.slug)).size).toBe(sections.length);
    for (const s of sections) expect(s.rows.length).toBeGreaterThan(0);
  });
});
