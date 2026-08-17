import { describe, test, expect } from 'vitest';
import { credentials } from '../src/data/profile.js';

const { certifications, programs, volunteering } = credentials;

describe('credentials', () => {
  // The section now claims every certification is listed below, so the named
  // list and the headline figure have to agree exactly. If one drifts, the
  // page starts lying about the other.
  test('every certification counted is also named', () => {
    expect(certifications.named).toHaveLength(certifications.count);
  });

  test('the headline count matches the structured count', () => {
    expect(certifications.headline).toContain(String(certifications.count));
  });

  test('named certifications are unique and non-empty', () => {
    const names = certifications.named;
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
    names.forEach((n) => expect(n.trim().length).toBeGreaterThan(3));
  });

  test('every external credential links over https', () => {
    certifications.also.forEach((cert) => {
      expect(cert.url, `${cert.name} has no url`).toMatch(/^https:\/\//);
      expect(cert.issuer).toBeTruthy();
      expect(cert.year).toMatch(/^\d{4}$/);
    });
  });

  test('programs carry an issuer and a year', () => {
    expect(programs.length).toBeGreaterThan(0);
    programs.forEach((p) => {
      expect(p.name).toBeTruthy();
      expect(p.issuer).toBeTruthy();
      expect(p.year).toBeTruthy();
    });
  });

  test('volunteering keeps the AIF record intact', () => {
    expect(volunteering.org).toBe('American India Foundation');
    expect(volunteering.role).toBeTruthy();
    expect(volunteering.detail).toContain('Digital Equalizer');
  });
});
