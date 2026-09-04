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

  test('listed in teardown order, cover first', () => {
    const orders = PARTS.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => b - a));
  });

  test('the keyed lookup covers every part', () => {
    expect(Object.keys(PART)).toHaveLength(PARTS.length);
  });
});
