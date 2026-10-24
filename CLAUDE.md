# myan-portfolio / Claude Code Config

Personal portfolio, modelled on jeffreylin.dev. Live: myanptl.vercel.app
(myan-portfolio.vercel.app is an alias of the same project and must keep working:
that link went out to YC companies).

## Stack
- React 18 + Vite (JS, ESM). No other runtime dependencies.
- `vitest` for unit tests.

## The design
- One column. A video drawn as WebGL pixel diamonds on top (`Mosaic.jsx`):
  licensed lily by day, jellyfish by night. Each clip plays once, fades, rewinds.
- Two short paragraphs, `linkedin github email`, then plain rows: Experience,
  Projects, Motion, Programs. Row data lives in `src/data/`.
- Techy details: the name decodes in (`Scramble.jsx`), a live Westford clock,
  a video timecode readout, numbered section headers, a hover arrow. All write
  to the DOM directly, never through state.
- Type: Geist and Geist Mono, self-hosted in `public/fonts`.
- Links take the colour of the clip: olive `#6b6536` by day, blue `#93c5fd` by night.

The 3D motion studies (turbofan and the rest) live in `~/workspace/motion/`,
not here.

## Commands
```bash
npm run dev
npm run build
npm test        # includes a slop lint over src/: em dashes, emoji, shadows, gradients
```

## Conventions
- No em dashes anywhere, comments included.
- Copy register: short declarative fragments.
- The CSP in `vercel.json` pins the inline theme script by sha256. Change that
  script and the hash must change with it.
- Bump the og image filename whenever it changes, or LinkedIn keeps the old one.

## Deploy
`git push origin main` deploys. Then load the live URL and confirm the change.
