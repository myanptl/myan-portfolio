import { describe, test, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/*
 * A lint pass for the tells that mark a page as machine-written.
 *
 * These are not style opinions. Each one is a pattern that showed up in an
 * audit of the previous version of this site, and the point of checking them
 * mechanically is that they creep back in one line at a time.
 */

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sources = walk('src').filter((f) => /\.(jsx?|css)$/.test(f));
const read = (f) => ({ file: f, text: readFileSync(f, 'utf8') });

describe('copy hygiene', () => {
  test('no em dashes anywhere', () => {
    const offenders = sources.map(read).filter(({ text }) => text.includes('—'));
    expect(offenders.map((o) => o.file)).toEqual([]);
  });

  test('no emoji', () => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const offenders = sources.map(read).filter(({ text }) => emoji.test(text));
    expect(offenders.map((o) => o.file)).toEqual([]);
  });

  // The visual tells. Radii, shadows and blurred glass were the previous
  // site's default garnish; the only radius left is on the 6px hotspot dot,
  // which is a dot and has to be round.
  test('no drop shadows or backdrop blur in the stylesheets', () => {
    const css = sources.filter((f) => f.endsWith('.css')).map(read);
    const offenders = css.filter(({ text }) => /box-shadow:|backdrop-filter:/.test(text));
    // The hotspot's focus ring is a box-shadow used as a ring, not a shadow.
    expect(offenders.map((o) => o.file)).toEqual(['src/styles/global.css']);
  });

  test('no gradients used as decoration', () => {
    const css = sources.filter((f) => f.endsWith('.css')).map(read);
    const offenders = css.filter(({ text }) => /radial-gradient|conic-gradient/.test(text));
    expect(offenders.map((o) => o.file)).toEqual([]);
  });

  test('no console.log left behind', () => {
    const js = sources.filter((f) => /\.jsx?$/.test(f)).map(read);
    const offenders = js.filter(({ text }) => /console\.log\(/.test(text));
    expect(offenders.map((o) => o.file)).toEqual([]);
  });
});
