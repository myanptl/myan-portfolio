// The work, flat. One entry per shipped thing.
//
// `media` is the basename of a real capture in /public/work, shown whole in the
// hover preview. Nothing is cropped, filtered or overlaid.
//
// Voice: name, role, year. A role is what the thing IS, in two or three words.
// No slogans, no verbs doing work the product should do.

export const workIndex = [
  {
    name: 'FocusOS',
    role: 'AI study app, audited against OWASP',
    year: '2026',
    media: 'focusos',
    href: 'https://focusos.live',
  },
  {
    name: 'NYE Media',
    role: 'Nonprofit for student builders',
    year: '2026',
    media: 'nyemedia',
    href: 'https://nyemedia.org',
  },
  {
    name: 'VulnScan',
    role: 'OWASP Top 10 scanner',
    year: '2026',
    media: 'vulnscan',
    href: 'https://vulnscan-xi.vercel.app/',
  },
  {
    name: 'PromptProbe',
    role: 'LLM red-teaming, one click',
    year: '2026',
    media: 'promptprobe',
    href: 'https://promptprobe.vercel.app',
  },
  {
    name: 'SlideAir',
    role: 'Gesture-controlled presenting',
    year: '2026',
    media: 'slideair',
    href: 'https://slideair.vercel.app',
  },
  {
    name: 'SlideStack',
    role: 'Topic in, carousel out',
    year: '2026',
    media: 'slidestack',
    href: 'https://slidestack-beta.vercel.app',
  },
  {
    name: 'RepoRoast',
    role: 'An AI reads your GitHub',
    year: '2026',
    media: 'reporoast',
    href: 'https://reporoast-alpha.vercel.app',
  },
  {
    name: 'keyhound',
    role: 'Secret scanner, zero dependencies',
    year: '2026',
    media: 'keyhound',
    href: 'https://github.com/myanptl/keyhound',
  },
  {
    name: 'fable-jarvis',
    role: 'Terminal assistant, read only',
    year: '2026',
    media: 'jarvis',
    href: 'https://www.npmjs.com/package/fable-jarvis',
  },
  {
    name: 'etf-research-mcp',
    role: 'Live ETF tools for Claude',
    year: '2026',
    media: 'etfmcp',
    href: 'https://www.npmjs.com/package/etf-research-mcp',
  },
  {
    name: 'EquityLens',
    role: 'Equity scoring model',
    year: '2026',
    href: 'https://github.com/myanptl',
  },
];

export const marqueeWords = workIndex.map((item) => item.name.toUpperCase());
