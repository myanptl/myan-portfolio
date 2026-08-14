// Layout mapping for the work sequence. Content itself stays in profile.js;
// this file only decides how each project is shown and which capture it uses.
//
// `media` is the basename in /public/work. Every capture is a real screenshot
// of the shipped product or real CLI output. Nothing here is a mockup.

export const takeovers = [
  {
    name: 'FocusOS',
    media: 'focusos',
    alt: 'The FocusOS landing page: the words DEEP WORK set very large in white on black, with a volt-green session button.',
    line: 'An AI study app, then a full OWASP audit of my own work.',
    meta: ['React · Supabase · Claude API', 'focusos.live'],
    href: 'https://focusos.live',
    stat: '17 findings · 2 critical · all fixed',
  },
  {
    name: 'NYE Media',
    media: 'nyemedia',
    alt: 'The NYE Media front page: GET IN THE ROOM in mint and peach on deep green, above photographs from the first Innovation Challenge.',
    line: 'The nonprofit I co-founded for student builders.',
    // Pulled down so the Innovation Challenge photographs stay in frame.
    focus: 'center 34%',
    meta: ['Co-founder & CTO', 'nyemedia.org'],
    href: 'https://nyemedia.org',
    stat: '30 students · 5 teams · RSM Boston',
  },
  {
    name: 'VulnScan',
    media: 'vulnscan',
    alt: 'A VulnScan report on warm manila paper: a CRITICAL stamp, an OWASP category strip, and four findings beside syntax-highlighted source.',
    line: 'Paste code, get the OWASP Top 10 back in seconds.',
    // Holds the CRITICAL stamp and the findings list in frame.
    focus: 'center 22%',
    meta: ['Static analysis · 12 languages', 'vulnscan-xi.vercel.app'],
    href: 'https://vulnscan-xi.vercel.app/',
    stat: 'A01 through A10 · no login',
  },
];

// Pairs render two entries offset from one another. `scale` drives the size
// difference; `offset` pushes the second item down so the row never reads as
// a grid.
export const pairs = [
  {
    id: 'pair-a',
    items: [
      {
        name: 'PromptProbe',
        media: 'promptprobe',
        alt: 'The PromptProbe scanner in monochrome: provider, target model and API key fields above a run button.',
        line: 'Red-teams your chatbot against the OWASP LLM Top 10.',
        href: 'https://promptprobe.vercel.app',
        scale: 'lg',
      },
      {
        name: 'SlideAir',
        media: 'slideair',
        alt: 'The SlideAir landing page for webcam gesture-controlled presentations.',
        line: 'Present with your hands. Tracking runs on-device.',
        href: 'https://slideair.vercel.app',
        scale: 'sm',
        offset: true,
      },
    ],
  },
  {
    id: 'pair-b',
    items: [
      {
        name: 'SlideStack',
        media: 'slidestack',
        alt: 'SlideStack on cream graph paper with an orange-red wordmark, showing a generated carousel about why study sessions fail beside the settings panel.',
        line: 'Type a topic, get an Instagram carousel as PNGs.',
        href: 'https://slidestack-beta.vercel.app',
        scale: 'sm',
      },
      {
        name: 'RepoRoast',
        media: 'reporoast',
        alt: 'The RepoRoast landing page, where a GitHub username gets roasted then hyped.',
        line: 'An AI that roasts your GitHub, then builds you back up.',
        href: 'https://reporoast-alpha.vercel.app',
        scale: 'lg',
        offset: true,
      },
    ],
  },
  {
    id: 'pair-c',
    items: [
      {
        name: 'keyhound',
        media: 'keyhound',
        alt: 'keyhound running in a terminal: 22 findings across 5 files, severities in red and amber, every secret redacted.',
        line: 'Finds leaked keys in your code and your git history.',
        href: 'https://github.com/myanptl/keyhound',
        scale: 'lg',
      },
      {
        name: 'fable-jarvis',
        media: 'jarvis',
        alt: 'The fable-jarvis command line help output in a terminal.',
        line: 'A terminal assistant that can look, never touch.',
        href: 'https://www.npmjs.com/package/fable-jarvis',
        scale: 'sm',
        offset: true,
      },
    ],
  },
  {
    id: 'pair-d',
    items: [
      {
        name: 'etf-research-mcp',
        media: 'etfmcp',
        alt: 'A live etf-research-mcp comparison of QQQM, VUG, VOO and IJR in a terminal.',
        line: 'Gives Claude live ETF research. Installable in one line.',
        href: 'https://www.npmjs.com/package/etf-research-mcp',
        scale: 'lg',
      },
      {
        // No shipped UI to capture honestly, so this one is typographic.
        name: 'EquityLens',
        line: 'A scoring model I built, then used to write a full AMZN pitch.',
        note: 'Valuation 40 · Earnings 25 · Insider 20 · Attention 15',
        href: 'https://github.com/myanptl',
        textOnly: true,
        offset: true,
      },
    ],
  },
];

export const marqueeWords = [
  'FOCUSOS',
  'PROMPTPROBE',
  'VULNSCAN',
  'SLIDEAIR',
  'SLIDESTACK',
  'REPOROAST',
  'KEYHOUND',
  'FABLE-JARVIS',
  'ETF-RESEARCH-MCP',
  'NYE MEDIA',
  'EQUITYLENS',
];
