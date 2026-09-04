# myan-portfolio / Claude Code Config

Personal portfolio. One object, one colour, almost no text.
Live: myan-portfolio.vercel.app

## Stack
- React 18 + Vite (JS, ESM).
- `three` 0.185.1 for the scene, `lenis` 1.3.26 for scrolling. Both pinned.
- `vitest` for unit tests.

## The design, in four rules

**1. One object, and it is the only colour on the site.** A high bypass
turbofan, built from primitives in `src/scene/`, comes apart as you scroll. The
UI is monochrome: one text colour at three strengths, no accent, no polarity
flip. The only chromatic pixels anywhere are the engine's hot section, and that
colour is a fact rather than a choice: a combustor and the turbine behind it run
heat discoloured for their whole service life.

**1b. It never stops moving.** Both spools turn continuously, open or closed.
The version before this gated rotation on `1 - explode`, so every moving part
froze the moment the object opened and the entire teardown, the part anyone
actually scrolls through, was a still image. Do not reintroduce that gate.

**2. Scale contrast is the hierarchy.** The name is enormous, everything else is
a mono label. There is deliberately no middle size. If something needs emphasis
it gets scale, a hairline, or full brightness against the dimmed default.

**3. Say almost nothing.** Measured against the portfolios worth copying
(rauno.me ~55 words, paco.me ~275, emilkowal.ski ~285), the previous version of
this site ran ~1400. Target is under 150 visible words. A project gets its name
and what it IS in six words or fewer. The full record lives on LinkedIn.

**4. The scene owns itself.** `src/scene/director.js` runs every frame and
writes straight to the DOM. It never re-enters React. Nothing in the hot path
may call `setState`.

Type is exactly two self-hosted families: **Switzer** (display, weights 400/500
only) and **IBM Plex Mono** (labels, readouts). Not Inter.

## Layout of the scene

```
src/data/parts.js     the eleven parts as plain data, no three import
src/scene/shapes.js   primitive builders (rounded box, blade, lathe, ribbon)
src/scene/materials.js  one material set PER PART, so one can light while ten dim
src/scene/turbofan.js the assembly: what sits where, and the packed exploded row
src/scene/stage.js    renderer, lights, springs, explode, focus, hover, dispose
src/scene/director.js scroll choreography for every section
```

Part copy lives in `data/parts.js`, imported by both the geometry and the
markup, so the 3D and the accessible list can never drift.

## Traps that have already bitten this repo

- **A canvas keeps ONE WebGL context for life**, and StrictMode double-invokes
  effects. `createStage` therefore creates and appends its own canvas and
  removes it on dispose. Never hand it a React-rendered `<canvas>`, and never
  call `loseContext()`.
- **three.js is dynamically imported.** It is ~146 kB gzipped against ~55 kB for
  everything else. Keep it out of the initial chunk.
- **`scroll-behavior: smooth` fights Lenis.** Do not reintroduce it.
- **Framing that ignores aspect ratio** parks the camera about twice too far
  out. Compute the distance for width AND height against `camera.aspect`, and
  recompute on resize. On portrait, drop the fill fraction too: the object is
  orbited, so its projected width exceeds what it was framed on.
- **`envMapIntensity` alone is not a dim.** On a saturated metal, less reflected
  environment reveals MORE base colour, so the copper got brighter as it
  receded. Bring `color` down with it. Never dim with opacity here: it would
  force depth sorting across seven interleaved layers.
- **Large recessed metal needs a LIGHTER tint, small proud metal a darker one.**
  The casting is a deep tub and rendered as glossy black plastic until it was
  tinted up; the opposite rule applies everywhere else.
- **A part parked end-on reads as debris.** Blades must be boxes, never planes:
  a zero-thickness blade vanishes edge on and a stage of them reads as scattered
  debris rather than as a disc.
- **The exploded row is packed by each part's real size, not on a fixed pitch.**
  An even pitch suits a laminated stack. Here the nacelle is 6.5 long and the HP
  turbine is 0.5, so a fixed spacing buries ten parts inside the cowl. See the
  layout pass at the end of `turbofan.js`.
- **Frame the exploded row from its MEASURED width.** Estimating it from the
  assembled size is short by most of a nacelle, and put the cowl across half the
  screen.
- **`setFraming` must not clobber a focused part's distance.** It runs every
  frame; without the `if (!focused)` guard the zoom onto a named part is undone
  before the spring travels a pixel.
- **Frame a focused part on ITS OWN extents.** Using the engine's height meant
  the 5.4 nacelle diameter dominated every calculation and the camera never
  moved in.
- **Do not bake a hub radius into blade geometry.** Scaling a stage then shrinks
  its hub along with its span, and in a real compressor those go opposite ways.
  Each instance carries its own radial offset instead.
- **Yaw is driven by the explode, not by scroll progress.** The hero wants a
  front three-quarter angle to see the fan down the inlet; the exploded row
  wants near broadside, or perspective squashes the core behind the cowl.
- **The group origin is not the part.** Labels anchor to each part's
  bounding-box centre, measured once in local space.
- **`ch` in a max-width resolves against the element's own font-size, but inside
  a grid track against the container's.** Size paragraphs in their own `ch`.
- **Under reduced motion the teardown is SHORTER than the viewport**, so
  `height - innerHeight` goes negative and progress flips sign. Guarded in
  `updateTeardown`; keep the guard.
- **Test the later section FIRST** in the director. Adjacent sections both claim
  the camera at their seam.

## Commands
```bash
npm run dev
npm run build
npm test        # includes a slop lint over src/: em dashes, emoji, gradients
```

## Conventions
- Animate `transform` and `opacity`. `scaleX` for the scrub, never `width`.
- **No em dashes anywhere, comments included.** `tests/copy.test.js` enforces it.
- Copy register: short declarative fragments. State what a thing is. No slogans,
  no swagger, no lines about breaking things.
- Files under 500 lines.

## Measuring in the automation browser
An occluded Chrome window throttles rAF to 1 Hz, which shows up as ~1000 ms
frames and makes `take_screenshot` hang forever waiting for a fresh frame. It is
not the scene. `select_page` with `bringToFront` fixes it. Verify with a frame
timing sample before optimising anything.

## Audit before calling it done
Check at 390, 768, 1024, 1440: no horizontal overflow, the part label never runs
off the right edge (it flips near the edge), no console errors, and the teardown
collapses to a readable list under reduced motion.

## Deploy
Vercel CLI, not git push. `npx vercel deploy --prod --yes`, then load the live
URL and confirm the change is really there.
