// Layout mapping for the work sequence. Content itself stays in profile.js;
// this file only decides how each project is shown and which capture it uses.
//
// `media` is the basename in /public/work. Every capture is a real screenshot
// of the shipped product or real CLI output. Nothing here is a mockup.
//
// Voice: terse. Category, name, year as metadata. One declarative line per
// project, no marketing verbs, no em dashes.

export const takeovers = [
  {
    name: 'FocusOS',
    media: 'focusos',
    category: 'AI Product',
    year: '2026.06',
    alt: 'The full FocusOS site: DEEP WORK set very large in white on black with a volt-green session button, above the session and subject sections.',
    line: 'An AI study app. Then I audited it like an attacker.',
    meta: ['React · Supabase · Claude API', 'focusos.live'],
    href: 'https://focusos.live',
    stat: '17 findings · 2 critical · all fixed',
  },
  {
    name: 'NYE Media',
    media: 'nyemedia',
    category: 'Nonprofit',
    year: '2026.07',
    alt: 'The full NYE Media site: GET IN THE ROOM in mint and peach on deep green, above photographs from the first Innovation Challenge and the programs index.',
    line: 'A nonprofit for student builders. I co-founded it and I run the platform.',
    meta: ['Co-founder & CTO', 'nyemedia.org'],
    href: 'https://nyemedia.org',
    stat: '30 students · 5 teams · RSM Boston',
  },
  {
    name: 'VulnScan',
    media: 'vulnscan',
    category: 'Security',
    year: '2026.07',
    alt: 'A VulnScan report on warm manila paper: a CRITICAL stamp, the OWASP category strip, and four findings beside syntax-highlighted source.',
    line: 'Paste code. Get the OWASP Top 10 back in seconds.',
    meta: ['Static analysis · 12 languages', 'vulnscan-xi.vercel.app'],
    href: 'https://vulnscan-xi.vercel.app/',
    stat: 'A01 through A10 · no login',
  },
];

// Every card is the same size. Difference comes from the captures, not from
// the layout.
export const workA = [
  {
    name: 'PromptProbe',
    media: 'promptprobe',
    category: 'Security',
    year: '2026.07',
    alt: 'The PromptProbe scanner in monochrome, with provider, target model and API key fields above a run button.',
    line: 'Red-teams your chatbot against the OWASP LLM Top 10.',
    href: 'https://promptprobe.vercel.app',
  },
  {
    name: 'SlideAir',
    media: 'slideair',
    category: 'Interaction',
    year: '2026.07',
    alt: 'The SlideAir landing page for webcam gesture-controlled presentations, in deep green.',
    line: 'Present with your hands. Tracking never leaves the device.',
    href: 'https://slideair.vercel.app',
  },
];

export const workB = [
  {
    name: 'SlideStack',
    media: 'slidestack',
    category: 'AI Product',
    year: '2026.07',
    alt: 'SlideStack on cream graph paper with an orange-red wordmark, showing a generated carousel about why study sessions fail beside the settings panel.',
    line: 'Type a topic. Get an Instagram carousel as ready PNGs.',
    href: 'https://slidestack-beta.vercel.app',
  },
  {
    name: 'RepoRoast',
    media: 'reporoast',
    category: 'Experiment',
    year: '2026.06',
    alt: 'The RepoRoast landing page in oxblood and marquee gold, where a GitHub username gets roasted and then hyped.',
    line: 'An AI roasts your GitHub, then builds you back up.',
    href: 'https://reporoast-alpha.vercel.app',
  },
];

export const workC = [
  {
    name: 'keyhound',
    media: 'keyhound',
    category: 'Security',
    year: '2026.07',
    alt: 'keyhound running in a terminal: 22 findings across 5 files, severities in red and amber, every secret redacted.',
    line: 'Finds leaked keys in your code and your git history.',
    href: 'https://github.com/myanptl/keyhound',
  },
  {
    name: 'fable-jarvis',
    media: 'jarvis',
    category: 'Open Source',
    year: '2026.07',
    alt: 'The fable-jarvis command line help output in a terminal, listing chat, briefing and memory commands.',
    line: 'A terminal assistant that can look and never touch.',
    href: 'https://www.npmjs.com/package/fable-jarvis',
  },
];

export const workD = [
  {
    name: 'etf-research-mcp',
    media: 'etfmcp',
    category: 'Open Source',
    year: '2026.07',
    alt: 'A live etf-research-mcp comparison of QQQM, VUG, VOO and IJR in a terminal, showing price, YTD return and expense ratios.',
    line: 'Gives Claude live ETF research. One line to install.',
    href: 'https://www.npmjs.com/package/etf-research-mcp',
  },
  {
    // No shipped UI to capture honestly, so this one stays typographic.
    name: 'EquityLens',
    category: 'Research',
    year: '2026.06',
    line: 'A scoring model I built, then used to write a full AMZN pitch.',
    note: 'VALUATION 40\nEARNINGS 25\nINSIDER 20\nATTENTION 15',
    href: 'https://github.com/myanptl',
    textOnly: true,
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
