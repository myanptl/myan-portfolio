# Portfolio redesign: "Instrument"

Date: 2026-08-14
Status: approved, ready for planning
Repo: `~/workspace/myan-portfolio`

## Problem

The live site (`myan-portfolio.vercel.app`) runs a "syntax on paper" light editor
theme. Myan's assessment, 2026-08-14: it "looks unplanned" and "nobody wants to
keep scrolling through it over and over."

The root cause is structural, not chromatic. The page is a generic section stack
(Hero, Projects, Experience, Skills, Credentials, Footer), which is the layout
models converge on by default. Repainting that stack black would leave it
reading as unplanned. See the `sites-look-ai-generated` memory note: the fix is
structuring a site by its own content logic, and committing to one mechanic that
means something for this specific product.

## References (opened, not summarised)

**shutterkif-oss.github.io** (Ahnaf Akif, filmmaker, Dhaka). Pure `#000`/`#fff`,
zero color. Two families: Helvetica italic display, VCR bitmap mono for labels.
Five `<canvas>` layers driving contour lines, halftone-dithered star shapes, and
a surveillance-HUD overlay (crosshairs, corner brackets, `TRK_03 0.943`
telemetry). A chrome die floats inside the wordmark. Vanilla JS. `invert` and
`music on/off` toggles. Work index paginated `01/09` with arrow controls.

**noth.in** (Awwwards Developer Award). Same grammar: black field, white
Helvetica, one rendered object substituted into the wordmark, technical numeral
counter at the foot.

The shared language is: monochrome, wordmark as hero, one physical object,
technical numerals, lateral index.

## Decisions taken

| Decision | Choice | Rationale |
|---|---|---|
| Direction | Instrument | Closest to the named reference, and monochrome satisfies the standing minimal rule with nothing left to go rainbow |
| Color | Pure `#000`/`#fff` | Zero accent. Distinction comes from grain, type, motion. Cannot collide with his other apps |
| Structure | Lateral work index | Directly answers the endless-scroll complaint |
| Legibility | Push it, with an escape hatch | Plain list view one click away for recruiters and admissions |
| 3D | None | No three.js. Canvas 2D only, to hold the 150kb gzipped budget |

## Honesty constraint

shutterkif's HUD reads as earned because he is a filmmaker and the vocabulary is
camera tracking. Transplanted onto a developer portfolio with nothing behind it,
the same HUD becomes costume, which is the exact failure mode being fixed.

So the instrument must measure real things. Every readout the reticle prints is
sourced from real data: stack and ship date from `profile.js`, and live repo
stats from the existing `useGithubStats` hook. No invented telemetry, no
decorative numbers that do not correspond to anything.

## Architecture

### Navigation model

Three states, one page.

1. **Hero.** Full viewport. Wordmark `myan patel.` in Switzer italic, with a
   canvas halftone field behind it. Enter control drops into the index.
2. **Index.** The primary surface. One viewport per project, `01 / 11`, moved
   through laterally by arrow keys, wheel, and pointer drag. Each entry carries
   name, tagline, stack, ship date, live link, and a reticle-driven readout.
3. **About overlay.** Opens over the index. Absorbs what were the Experience,
   Skills and Credentials sections. Dismissed by `Esc` or close control.

Plus **plain view**: a text list of all 11 projects with links, one control away
from the index. This is the escape hatch, and it is also the no-JS and
reduced-motion fallback.

### Component structure

Organised by surface, matching the existing convention.

```
src/
  components/
    hero/          Wordmark, enter control, halftone canvas
    index/         IndexTrack, IndexEntry, IndexCounter, IndexControls
    about/         AboutOverlay (experience, skills, credentials)
    plain/         PlainView
    reticle/       Reticle, ReticleReadout
    layout/        Icons, InvertToggle, SkipLink
  hooks/
    useReticle       pointer position, snap target, readout payload
    useIndexNav      active entry, keyboard/wheel/drag handling, bounds
    useHalftone      canvas dither render loop
    useGithubStats   existing, unchanged
    useReducedMotion new
  lib/
    dither.js        bayer matrix, halftone sampling
  data/
    profile.js       existing, unchanged as source of truth
```

Files stay under 400 lines. `profile.js` remains the single source of truth and
is not restructured, which also avoids the `SectionDecl` line-number resync trap
recorded in `portfolio-update-aug-3-2026`. That component is removed with the
old section stack, so the trap disappears entirely.

### Data flow

`profile.js` is read once at module scope. `useIndexNav` owns the active index
as the only piece of navigation state. `useReticle` owns pointer state and
derives its readout from the currently hovered element's data attributes, so it
never duplicates project data. `useGithubStats` fetches once, fails silently,
and any entry without stats simply prints fewer readout lines.

Stats are keyed by repo name, so only the 9 projects carrying a `repo` field in
`profile.js` get live readouts. NYE Media and EquityLens have no repo and print
their static readout lines only. This is the existing graceful-degradation
contract and it is unchanged.

No global store. No URL state beyond a hash for deep-linking an entry
(`#03`), which also gives shareable per-project links.

## Visual system

**Color.** `--black: #000`, `--white: #fff`, and greys derived only as
`rgba(255,255,255,α)`. The invert toggle swaps the two root tokens, so every
surface inverts from one place.

**Type.** Exactly two families, self-hosted, subset, `font-display: swap`.
- Display: **Switzer** (Fontshare, free for commercial use) italic, tight
  negative tracking, for the wordmark and project names.
- Telemetry: **Martian Mono** (Google Fonts, OFL) for all labels, counters and
  readouts. Chosen over a true bitmap face such as VCR OSD Mono because it holds
  legibility at 11px to 13px label sizes, which matters given the recruiter
  audience, while still reading as instrumentation.
- Deliberately not Inter, which is a recorded AI tell.
- Both licences are clean for a public personal site. No Helvetica, which is not
  redistributable.

**Grain.** Canvas bayer-matrix halftone dithering, rendered per frame at
throttled rate. Not a CSS noise PNG overlay.

**Rules and edges.** Radius `0` everywhere. No card borders. Structure is
carried by corner brackets, crosshairs, and 1px hairlines.

## Motion

| Element | Behaviour |
|---|---|
| Reticle | Crosshair plus corner brackets tracking the pointer with slight lag. Snaps to interactive targets and prints a readout beside them |
| Wordmark | Staggered per-character reveal on load |
| Index transition | Clip-path wipe between entries, direction matching travel |
| Halftone | Continuous slow dither animation, throttled |
| Hover | Bracket snap plus readout print. No fade-up wrappers anywhere |
| Invert | Instant token swap, no transition |

Motion marks state changes. There is no blanket scroll fade-up, which was one of
the four recorded AI tells.

## Accessibility

- `prefers-reduced-motion: reduce` disables reticle lag, wipes, halftone
  animation and wordmark stagger. Entries change instantly.
- The index is keyboard-navigable: arrows move, `Enter` opens the live link,
  `Esc` closes the overlay. Every entry is focusable and focus is visible.
- Plain view is the accessible equivalent, reachable by keyboard, and is what a
  screen reader is offered first via the skip link.
- Contrast is `#fff` on `#000`, which is 21:1.

## Performance

- Budget: under 150kb gzipped JS, under 30kb CSS.
- Canvas work is throttled and paused when the tab is hidden and when the
  halftone field is offscreen.
- Only `transform`, `opacity` and `clip-path` are animated.
- Fonts subset and preloaded, critical weight only.

## Testing

- Unit: `dither.js` matrix output, `useIndexNav` bounds and wrap behaviour,
  readout payload derivation.
- Visual: screenshots at 320, 768, 1024, 1440, both normal and inverted.
- Interaction: keyboard navigation through all 11 entries, overlay open/close,
  plain view toggle.
- Reduced motion: verify every animation is disabled.
- Build and `npm test` green before deploy.

## Docs to update alongside the code

`myan-portfolio/CLAUDE.md` currently documents the "syntax on paper" palette as
the house convention and states that no test framework is installed, which is
now false since vitest was added. Both need rewriting to describe the Instrument
system, or the next session will be told to preserve an aesthetic that no longer
exists.

`README.md` carries a screenshot of the old design and needs a new one.

## Out of scope

- No audio. shutterkif has a music toggle; it is not wanted here.
- No 3D or WebGL.
- No content rewrite. `profile.js` copy is unchanged in this pass.
- No deploy. Localhost only, per instruction, deploy is a separate decision.

## Copy rule

No em dashes in any newly written copy. Existing `profile.js` copy is left as
is. Grep before calling the work done.
