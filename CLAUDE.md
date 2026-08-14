# myan-portfolio — Claude Code Config

Personal portfolio, "The Record": a monochrome, motion-led site where the only
color on the page comes from screenshots of the work itself.
Live: myan-portfolio.vercel.app

## Stack
- React 18 + Vite (JS, ESM). Runtime deps are only `react` + `react-dom`.
- `vitest` for unit tests. `sharp` (dev only) for encoding work captures.
- No linter installed. Keep it lean unless there is a real need.

## The design system, in one rule

**Chrome is pure `#000` / `#fff`. Color is work, or it is not there.**

Every product Myan ships has its own committed palette. On a black and white
site those screenshots become the only color, so the portfolio ends up showing
the palette discipline it was built under. Do not add an accent hue, a gradient,
or a colored state to the chrome. If something needs emphasis, use scale,
weight, a hairline, or polarity.

- Polarity is one pair of tokens (`--bg` / `--fg`) swapped per section via
  `data-polarity` on a `<section>`. `usePolarity` mirrors the active section
  onto `<html>` so the body ground and header always match. Never write a
  parallel dark-mode ruleset.
- Type is exactly two self-hosted families: **Switzer** (display) and
  **IBM Plex Mono** (all labels, counters, readouts). Not Inter. Not Helvetica.
- Radius `0`. No card borders. Structure comes from hairlines and offset.
- Reference: noth.in. Secondary: shutterkif-oss.github.io.

## Layout

Long vertical scroll where **no two consecutive screens share a shape**:
hero, statement, then staggered pair / full-bleed takeover alternating, then an
inverted marquee, then The Record (white), then contact.

- `StaggeredPair` items are deliberately unequal in size and vertically offset.
  If a pair ever reads as a tidy grid, that is the bug.
- `Takeover` uses `height: 100svh` (not `min-height`) because a `1fr` grid row
  only divides space that is already definite; with `min-height` the image's
  intrinsic aspect sizes the row and pushes the type off-screen.
- Takeover media and type never overlap. These captures carry their own
  typography, so text set on top of them produces two competing headlines.

## Work imagery

`src/data/work.js` maps projects to captures and layout slots. Content stays in
`src/data/profile.js`, which is the single source of truth.

**Every capture is real.** Live-site screenshots, or real CLI output typeset by
`scripts/build-terminals.mjs`. No mockups, no generated stand-ins. If a product
has no honest capture, it becomes a typographic entry (`textOnly: true`), which
is what EquityLens does.

Prefer a **working state** over a landing page. VulnScan's demo report and
SlideStack's no-key demo make far stronger images than their empty forms.

```bash
# after re-capturing into .capture/ (gitignored)
node scripts/process-media.mjs   # -> public/work/*.{avif,webp} at 800 and 1440
node scripts/build-terminals.mjs # -> .capture/term/*.html to screenshot
```

`tests/work-data.test.js` fails if a referenced capture file is missing, so a
blank panel cannot ship silently.

## Commands
```bash
npm run dev
npm run build
npm test
```

## Conventions
- Animate only `transform`, `opacity`, `clip-path`. Respect
  `prefers-reduced-motion` (the hook and the global reduce block).
- Motion marks state changes. **No blanket scroll fade-up wrapper** on every
  section; that is a recorded AI tell and it is what the old build did.
- **No em dashes in new copy.** Use periods, commas, or a slash. Grep before
  calling work done.
- Accessibility: 21:1 in both polarities, keyboard-navigable, real `alt` prose
  on every capture, marquee is `aria-hidden` with an `sr-only` equivalent.
- Live GitHub stats: handle rate limits gracefully, never hardcode numbers.
- Budgets: under 150kb gzipped JS, under 30kb CSS. Currently ~56kb / ~3.4kb.

## Deploy
Vercel CLI, not git push. `npx vercel deploy --prod --yes`, then load the live
URL and confirm the behaviour changed.

## Tooling available
- MCP `context7` — live React/Vite docs.
- Global agents: `react-reviewer`, `a11y-architect`.
