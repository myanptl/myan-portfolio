import { describe, test, expect } from 'vitest';
import { median, timeAgo, subject } from '../src/lib/telemetry.js';

describe('median', () => {
  test('returns null for no samples', () => {
    expect(median([])).toBeNull();
  });

  test('picks the middle of an odd count without mutating the input', () => {
    const samples = [300, 100, 200];
    expect(median(samples)).toBe(200);
    expect(samples).toEqual([300, 100, 200]);
  });

  test('averages the two middle values of an even count', () => {
    expect(median([100, 200, 300, 401])).toBe(250);
  });
});

describe('timeAgo', () => {
  const now = Date.parse('2026-10-20T12:00:00Z');

  test('says just now under a minute', () => {
    expect(timeAgo('2026-10-20T11:59:30Z', now)).toBe('just now');
  });

  test('uses minutes, hours, days and months', () => {
    expect(timeAgo('2026-10-20T11:15:00Z', now)).toBe('45 min ago');
    expect(timeAgo('2026-10-20T07:00:00Z', now)).toBe('5 h ago');
    expect(timeAgo('2026-10-11T12:00:00Z', now)).toBe('9 d ago');
    expect(timeAgo('2026-06-01T12:00:00Z', now)).toBe('4 mo ago');
  });

  test('never goes negative for a clock that runs ahead', () => {
    expect(timeAgo('2026-10-20T12:05:00Z', now)).toBe('just now');
  });
});

describe('subject', () => {
  test('keeps only the first line of a commit message', () => {
    expect(subject('feat: thing\n\nlonger body')).toBe('feat: thing');
  });

  test('copes with a missing message', () => {
    expect(subject(undefined)).toBe('');
  });
});
