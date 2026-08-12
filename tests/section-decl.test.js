import { describe, test, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Every section header on this site renders `profile.js:<lineno>` and claims
 * that number is the real line of the matching `export const` in
 * src/data/profile.js. Nothing enforced that, so any edit to profile.js that
 * shifted a line left the site quietly displaying wrong line numbers. It has
 * happened before. This is the guard.
 */

function profileExportLines() {
  const src = readFileSync(join(root, 'src/data/profile.js'), 'utf8')
  const lines = new Map()
  src.split('\n').forEach((line, i) => {
    const m = line.match(/^export const (\w+)/)
    if (m) lines.set(m[1], i + 1) // editors are 1-indexed
  })
  return lines
}

function declaredSections() {
  const found = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) { walk(path); continue }
      if (!entry.name.endsWith('.jsx')) continue
      const src = readFileSync(path, 'utf8')
      // <SectionDecl ... name="x" ... lineno={N} ... /> in either prop order
      for (const block of src.matchAll(/<SectionDecl\b([^>]*)>/gs)) {
        const attrs = block[1]
        const name = attrs.match(/name="([^"]+)"/)?.[1]
        const lineno = attrs.match(/lineno=\{(\d+)\}/)?.[1]
        if (name && lineno) {
          found.push({ name, lineno: Number(lineno), file: path.replace(root + '/', '') })
        }
      }
    }
  }
  walk(join(root, 'src/components'))
  return found
}

describe('SectionDecl line numbers', () => {
  const exports = profileExportLines()
  const sections = declaredSections()

  test('finds the section declarations to check', () => {
    expect(sections.length).toBeGreaterThan(0)
  })

  test.each(sections)('$name in $file points at a real export', ({ name }) => {
    expect(
      exports.has(name),
      `profile.js has no "export const ${name}"; known exports: ${[...exports.keys()].join(', ')}`
    ).toBe(true)
  })

  test.each(sections)('$name claims the correct line', ({ name, lineno, file }) => {
    expect(
      lineno,
      `${file} says profile.js:${lineno} for "${name}", but that export is on line ${exports.get(name)}. ` +
        `Update the lineno prop to ${exports.get(name)}.`
    ).toBe(exports.get(name))
  })
})
