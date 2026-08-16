# myan-portfolio — Claude Code Config

Personal portfolio. Motion-led, typographic, alternating paper and ink.
Live: myan-portfolio.vercel.app

## Stack
- React 18 + Vite (JS, ESM). Runtime deps are only `react` + `react-dom`.
- `vitest` for unit tests. `sharp` (dev only) for encoding work captures.
- No animation library. No three.js. Every effect here is hand-written.

## The design, in three rules

**1. Polarity, not one long dark page.** Sections alternate ink ground and
paper ground via `data-polarity` on the `<section>`. `usePolarity` mirrors the
section at the top of the viewport onto `<html>` so the fixed header and grid
always match what sits behind them. Never write a parallel dark-mode ruleset.

**2. No chrome accent.** The only colour on the page comes from work captures
in the hover previews. If something needs emphasis: scale, weight, a hairline,
or inverting the row.

**3. Motion is the point.** Lerped scrolling, a cursor-reactive WebGL field,
magnetic links, word-mask reveals, velocity-linked skew. Nothing on the page
should feel inert. All of it collapses under `prefers-reduced-motion`.

Type is exactly two self-hosted families: **Switzer** (display) and **IBM Plex
Mono** (labels, readouts, numerals). Not Inter. Not Helvetica.

## Work presentation

The work is a **typographic index**, not a grid of screenshots. Hovering a row
floats that project's capture beside the pointer, whole and untouched.

This replaced a grid of cropped cards with dithered overlays. Both the cropping
and the overlay were rejected: covering a screenshot or slicing a band out of
it makes the product unreadable. **Captures are shown complete, unfiltered, or
not at all.**

Every capture is real: live-site screenshots, or real CLI output typeset by
`scripts/build-terminals.mjs`. No mockups. EquityLens has no honest capture, so
it simply has no preview.

```bash
# after re-capturing into .capture/ (gitignored)
node scripts/process-media.mjs   # -> public/work/*.{avif,webp}
node scripts/build-terminals.mjs # -> .capture/term/*.html to screenshot
```

`tests/work-index.test.js` fails if a referenced capture is missing.

## Traps that have already bitten this repo

- **`scroll-behavior: smooth` fights the lerped scroller.** The scroller writes
  `scrollTo` every frame; CSS smooth scrolling turns each write into its own
  animation that the next frame cancels, and the page crawls at ~1px/frame. Do
  not reintroduce it.
- **GLSL `smoothstep` is undefined when `edge0 > edge1`.** The reversed-edge
  idiom returned 1.0 everywhere and filled the hero canvas solid white. Write
  `1.0 - smoothstep(lo, hi, x)`.
- **The WebGL context is `premultipliedAlpha`.** Emit `vec4(vec3(lit), lit)`.
  Colour above alpha composites as opaque white.
- **Never call `loseContext()` in cleanup.** A canvas keeps one context for
  life, and StrictMode double-invokes effects in dev, so the second mount gets
  a dead context and silently renders nothing.
- **Masked text reveals shear tall glyphs.** Any `overflow: hidden` mask around
  display type needs vertical padding, and large numerals should not be
  clip-path revealed at all. This is what cut the top off the credentials `18`.
- **`overflow: hidden` on a section to contain a bleeding canvas also clips the
  section's own text.** Put the clipping on a wrapper around the canvas.

## Commands
```bash
npm run dev
npm run build
npm test
```

## Conventions
- Animate `transform`, `opacity`, `clip-path`. Publish pointer and scroll state
  as CSS custom properties rather than React state, so motion costs no renders.
- **No em dashes in copy.** Periods, commas, or a slash. Grep before finishing.
- Copy register: short declarative fragments. State what a thing is. No
  slogans, no swagger, no lines about breaking things.
- Accessibility: keyboard-navigable index, real `alt` prose, marquee is
  `aria-hidden` with an `sr-only` equivalent, reduced motion fully honoured.
- Budgets: under 150kb gzipped JS, under 30kb CSS. Currently ~57kb / ~3.9kb.

## Audit before calling it done
Check at 320, 390, 768, 1024, 1440: no horizontal overflow, no text sheared by
a clipping ancestor, no font below 10px, no console errors, and every reveal
actually fires (unfired reveals leave text translated out of its mask, which
reads as missing content).

## Deploy
Vercel CLI, not git push. `npx vercel deploy --prod --yes`, then load the live
URL and confirm the change is really there.
