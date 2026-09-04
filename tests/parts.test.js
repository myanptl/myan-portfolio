import { describe, test, expect } from 'vitest';
import { PARTS, PART } from '../src/data/parts.js';

describe('drive parts', () => {
  test('every part has a key, a name and a spec', () => {
    for (const p of PARTS) {
      expect(p.key).toMatch(/^[a-z]+$/);
      expect(p.name.trim()).toBeTruthy();
      expect(p.spec.trim().length).toBeGreaterThan(20);
    }
  });

  // The explode offset is `order * SPREAD`, so a duplicated order silently
  // stacks two parts on top of each other at full separation and one of them
  // simply cannot be seen.
  test('orders are unique and contiguous', () => {
    const orders = PARTS.map((p) => p.order).sort((a, b) => a - b);
    expect(new Set(orders).size).toBe(orders.length);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i] - orders[i - 1]).toBe(1);
    }
  });

  // The engine is stripped front to back, so the authored order and the axial
  // order run the same way. If they ever diverge, `step` is what the walk uses.
  test('listed in teardown order, front first', () => {
    const orders = PARTS.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  test('every part names a spool or is explicitly static', () => {
    for (const p of PARTS) {
      expect(['lp', 'hp', 'both', null]).toContain(p.spin);
    }
    // A teardown of an engine with nothing turning is a diagram, not a machine.
    expect(PARTS.filter((p) => p.spin).length).toBeGreaterThanOrEqual(6);
  });

  test('the keyed lookup carries each part its walk position', () => {
    PARTS.forEach((p, i) => expect(PART[p.key].step).toBe(i));
  });

  test('the keyed lookup covers every part', () => {
    expect(Object.keys(PART)).toHaveLength(PARTS.length);
  });
});
