# myan-portfolio — Claude Code Config

Terminal-aesthetic personal portfolio with a bento grid + live GitHub stats.
Live: myan-portfolio.vercel.app

## Stack
- React 18 + Vite (JS, ESM). Intentionally minimal — only `react` + `react-dom`.
- No linter/test framework installed (keep it lean unless there's a real need).

## Layout
- `src/` — components (terminal UI, bento grid, GitHub stats)
- `design/` — design references / assets
- `public/`, `dist/`

## Commands
```bash
npm run dev      # vite dev
npm run build    # vite build
npm run preview
```

## Conventions
- Hold the terminal aesthetic: monospace type, consistent palette, scanline/prompt motifs — intentional, not templated.
- Animate only compositor-friendly props (`transform`, `opacity`); respect `prefers-reduced-motion`.
- Accessibility: sufficient contrast on the dark terminal theme, keyboard-navigable, semantic HTML.
- Live GitHub stats: handle rate-limit/error states gracefully; never hardcode fabricated numbers.
- No secrets in the client bundle (GitHub calls are public/unauthenticated or proxied).

## Deploy
Vercel (`vercel --prod`). Push source to `main`.

## Tooling available
- MCP `context7` (global) — live React/Vite docs.
- Project agent `terminal-ui-reviewer` — aesthetic consistency, responsive, a11y.
- Global agents: `react-reviewer`, `a11y-architect`.
