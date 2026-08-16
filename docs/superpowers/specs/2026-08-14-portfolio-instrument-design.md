# Portfolio redesign: "The Record"

Date: 2026-08-14
Status: approved, ready for planning
Repo: `~/workspace/myan-portfolio`
Branch: `redesign/instrument`

## Problem

The live site runs a "syntax on paper" light editor theme. Myan's assessment,
2026-08-14: it "looks unplanned" and "nobody wants to keep scrolling through it
over and over."

The root cause is structural. The page is a generic section stack (Hero,
Projects, Experience, Skills, Credentials, Footer), which is the layout models
converge on by default. Repainting it black would leave it reading as unplanned.

Refined diagnosis after studying the reference: the complaint is not scroll
*length*. It is scroll *repetition*. Every section is currently the same shape,
so scrolling feels like no progress is being made.

## Primary reference: noth.in

Opened and inspected directly, 2026-08-14. Paris creative studio, Webflow.

- **11,602px tall.** A long vertical scroll that does not feel long, because no
  two screens share a shape.
- **Body is white.** Black is a scroll state. The site inverts as you move
  through it.
- Two families: PP Neue Montreal display, **IBM Plex Mono** for labels. The
  current site already loads IBM Plex Mono.
- Work items sit **staggered and vertically offset**, never a uniform grid. Each
  is a tiny mono label, one white sentence, and large media.
- Escalates into **full-bleed media takeovers** with a persistent mini-header
  carrying the wordmark and the current section name.
- A marquee of repeated text with glitched characters.
- Counter notation `( 07 )`. A `SOUND` toggle.
- **Site chrome is monochrome. All color enters through work imagery.**

Secondary reference: shutterkif-oss.github.io, which supplied the halftone and
technical-numeral vocabulary retained below.

## The organising idea

Myan has given every product its own committed palette: FocusOS, VulnScan's
manila dossier, SlideStack's cream and orange, RepoRoast's oxblood, NYE's deep
green. On a black and white site, **his screenshots become the only color on the
page.**

The portfolio therefore displays the palette discipline it was built under. That
is a mechanic that means something for this specific person, rather than
borrowed HUD costume. It is also the direct answer to "images of the work I've
done."

**Rule: no color in the chrome. Ever. Color is work, or it is not there.**

## Decisions taken

| Decision | Choice |
|---|---|
| Reference | noth.in as primary |
| Scroll | Long vertical, every screen a different shape |
| Color | Chrome pure `#000`/`#fff`. Color only from work media |
| Imagery | Real captures of all 11 projects |
| CLI projects | Real terminal captures |
| Type | Switzer (Fontshare) + IBM Plex Mono (already loaded) |
| 3D | None. No three.js |
| Deploy | Out of scope. Localhost only |

Superseded: the lateral `01 / 11` index and the cursor-reticle telemetry HUD
from the first draft. Both were shutterkif's structure. Reversed with approval
once noth.in became the primary reference.

## Section sequence

Eleven projects, eight movements. Polarity alternates.

| # | Polarity | Shape |
|---|---|---|
| 01 | black | Wordmark hero. `myan patel.` with a halftone field, one object set into the type |
| 02 | black | Statement. Huge type, three lines, who he is and what he ships |
| 03 | black | Staggered pair. Two projects, offset vertically, unequal sizes |
| 04 | full bleed | Takeover: **FocusOS** |
| 05 | black | Staggered pair |
| 06 | full bleed | Takeover: **NYE Media**, using real Innovation Challenge photography |
| 07 | black | Staggered pair |
| 08 | full bleed | Takeover: **PromptProbe** |
| 09 | invert | Marquee. Shipped product names scrolling, glitched characters |
| 10 | white | The Record. Full index of all 11, plus experience, skills, credentials |
| 11 | black | Contact |

Three takeovers are chosen as FocusOS (flagship), NYE Media (only one with real
photography, and it is the nonprofit he co-founded), and PromptProbe (the
clearest Plan A plus Plan B artifact).

"The Record" at 10 absorbs what were the Experience, Skills and Credentials
sections, and doubles as the plain readable view for recruiters and admissions.
It is white, so it is the most legible surface on the site by construction.

## Imagery pipeline

All 7 web products returned HTTP 200 on 2026-08-14 and can be captured live.

| Project | Source |
|---|---|
| FocusOS | focusos.live |
| PromptProbe | promptprobe.vercel.app |
| SlideAir | slideair.vercel.app |
| VulnScan | vulnscan-xi.vercel.app |
| SlideStack | slidestack-beta.vercel.app |
| RepoRoast | reporoast-alpha.vercel.app |
| NYE Media | nyemedia.org, plus existing event photography in `nye-media/public/` |
| keyhound | terminal capture, CLI running a scan |
| fable-jarvis | terminal capture, daily briefing |
| etf-research-mcp | terminal capture, tool call output |
| EquityLens | the scoring table, captured from the local build |

Capture at 1440x900 at 2x, then downscale and encode to AVIF with WebP fallback.
Explicit `width`/`height` on every image. Only the first takeover is `eager`
with `fetchpriority="high"`; everything else is `lazy`.

Budget: total image payload under 1.5MB across the page. If AVIF encoding puts
it over, reduce the staggered-pair captures before touching the takeovers.

**No invented imagery.** No mockups of products that do not look like that, no
generated abstract stand-ins. If a capture cannot be taken honestly, the entry
becomes a typographic block instead.

## Visual system

**Color.** `--fg` and `--bg` only, swapped by a `data-polarity` attribute on
each section. Greys derived as `rgba(var(--fg-rgb), α)`. Zero hue in chrome.

**Type.** Two families, self-hosted, subset, `font-display: swap`.
- Display: **Switzer** (Fontshare, free for commercial use). Chosen as the
  closest free analogue to PP Neue Montreal, which is a paid Pangram Pangram
  licence and cannot be shipped.
- Labels: **IBM Plex Mono** (OFL), already loaded by the current site.
- Not Inter, which is a recorded AI tell. Not Helvetica, not redistributable.

**Grain.** Canvas bayer-matrix halftone dither on the hero field only, so it
stays cheap. Not a CSS noise PNG.

**Edges.** Radius `0`. No card borders. Structure carried by hairlines, corner
brackets, and offset alone.

**Numerals.** Technical notation throughout: `( 11 )`, `2026.06`, section
indices as `01`.

## Motion

| Element | Behaviour |
|---|---|
| Wordmark | Staggered per-character reveal on load |
| Polarity | Scroll-driven inversion at section boundaries, tokens swap at the root |
| Media | Clip-path wipe reveal on enter, direction alternating per side |
| Staggered pairs | The two items scroll at slightly different rates |
| Takeovers | Media scales from 92% to 100% across the viewport pass |
| Marquee | Continuous horizontal translate, characters glitching on a timer |
| Hover | Media desaturates to mono on hover, restoring color on leave, which inverts the usual treatment and reinforces that color means work |
| Header | Sticky mini-header prints the current section name |

Motion marks state changes. There is **no blanket scroll fade-up wrapper**,
which was one of the four recorded AI tells and is currently on every section of
the live site.

## Architecture

```
src/
  components/
    hero/        Wordmark, HalftoneField
    statement/   Statement
    work/        StaggeredPair, Takeover, WorkMedia, WorkLabel
    marquee/     Marquee
    record/      Record (index, experience, skills, credentials)
    contact/     Contact
    layout/      StickyHeader, Icons, SkipLink
  hooks/
    usePolarity        active section polarity, drives root attribute
    useSectionInView   IntersectionObserver, shared by header and reveals
    useHalftone        canvas dither loop, hero only
    useGithubStats     existing, unchanged
    useReducedMotion   new
  lib/
    dither.js
  data/
    profile.js         existing, unchanged as source of truth
  assets/work/         captured media, AVIF + WebP
```

`profile.js` stays the single source of truth and is not restructured, which
avoids the `SectionDecl` line-number resync trap recorded in
`portfolio-update-aug-3-2026`. That component is deleted with the old stack, so
the trap disappears.

Files stay under 400 lines. `useGithubStats` is keyed by repo name; the 9
projects carrying a `repo` field get live stats in The Record, and NYE Media and
EquityLens print static lines only. That graceful-degradation contract is
unchanged.

## Accessibility

- `prefers-reduced-motion: reduce` disables wipes, parallax offset, marquee
  translate, halftone animation and wordmark stagger. Polarity still changes,
  instantly.
- Marquee is `aria-hidden`, since it is decorative and its glitched characters
  are not readable text.
- Every image carries a real `alt` describing the product, not the filename.
- Contrast is 21:1 in both polarities.
- The Record is fully keyboard-navigable and is what the skip link targets.

## Performance

- Under 150kb gzipped JS, under 30kb CSS. Images budgeted separately at 1.5MB.
- Canvas paused when offscreen and when the tab is hidden.
- Only `transform`, `opacity` and `clip-path` animated.
- IntersectionObserver throughout. No scroll handler churn.
- Fonts subset, critical weight preloaded only.

## Testing

- Unit: `dither.js` output, polarity resolution, readout derivation.
- Visual: screenshots at 320, 768, 1024, 1440, both polarities.
- Interaction: keyboard through The Record, skip link, sticky header labels.
- Reduced motion: verify every animation is disabled.
- Budget: confirm gzipped JS and total image payload after build.
- `npm run build && npm test` green.

## Open question to raise before build

Several `profile.js` taglines contain em dashes, which Myan has repeatedly
flagged as an AI tell. In this design the tagline is the single most prominent
line of copy per project, so they will be far more visible than they are today.
Proposal: draft em-dash-free rewrites and show them for approval. Do **not**
silently edit his shipped copy.

## Docs to update alongside the code

`myan-portfolio/CLAUDE.md` documents the "syntax on paper" palette as the house
convention and claims no test framework is installed, which became false when
vitest was added on Aug 11. Both need rewriting, or the next session will be
instructed to preserve an aesthetic that no longer exists.

`README.md` carries a screenshot of the old design and needs a new one.

## Out of scope

- No audio or sound toggle.
- No 3D or WebGL.
- No video. noth.in uses 4 full-bleed videos; stills only here, to hold budget.
- No content rewrite beyond the em-dash question above.
- No deploy. Localhost only, per instruction.
