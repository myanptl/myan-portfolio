// All content sourced from Myan Patel's real LinkedIn + GitHub (June 2026).
// Single source of truth — edit here to update the site.

export const profile = {
  name: 'Myan',
  fullName: 'Myan Patel',
  about: [
    'Aspiring GenAI Product Manager & AI Security Engineer',
    'Sophomore @ Westford Academy, MA · Class of 2028',
    'I build and secure AI products end to end.',
  ],
  links: [
    {
      label: 'linkedin',
      href: 'https://www.linkedin.com/in/myan-patel-1857943ba/',
      icon: 'linkedin',
      ariaLabel: 'Myan Patel on LinkedIn (opens in a new tab)',
    },
    {
      label: 'github',
      href: 'https://github.com/myanptl',
      icon: 'github',
      ariaLabel: 'Myan Patel on GitHub (opens in a new tab)',
    },
  ],
};

export const experience = [
  {
    role: 'App Developer & Product Researcher',
    org: 'FocusOS',
    meta: 'Self-employed · Jun 2026 – Present',
    link: { label: 'focusos.live', href: 'https://focusos.live' },
    bullets: [
      'Designed, built, and secured an AI-powered adaptive study app for high schoolers — React + Vite, Supabase, and the Claude API via edge functions.',
      'Authored a full Product Requirements Document (PRD V4) covering user research, learning science, and the feature roadmap.',
      'Integrated an AI-generated active-recall quiz system using spaced-repetition methodology.',
      'Ran a full security audit (17 findings, 2 critical — all remediated) plus performance and real-time presence fixes.',
      'Selected for the Suffolk University Pre-College Entrepreneurship Program and Summit STEM Fellowship (Summer 2026).',
    ],
  },
  {
    role: 'Arcade Attendant',
    org: 'Kimball Farm',
    meta: 'Part-time · Apr 2026 – May 2026',
    bullets: [],
  },
  {
    role: 'Tube Attendant',
    org: 'Nashoba Valley Ski Area',
    meta: 'Part-time · 2025 – 2026',
    bullets: [],
  },
];

export const projects = [
  {
    name: 'FocusOS',
    repo: 'focusos',
    tagline: 'AI study app + OWASP security case study',
    badge: 'Live · focusos.live',
    href: 'https://focusos.live',
    description:
      'An AI study app for high schoolers built with React, Supabase, and the Claude API. After launch I ran a full security audit against the OWASP Top 10 for LLM applications — found 17 issues, fixed two critical ones (an API key leak and a paywall bypass), and documented the rest.',
    tags: ['React', 'Vite', 'Supabase', 'Claude API', 'Security'],
  },
  {
    name: 'RepoRoast',
    repo: 'reporoast',
    tagline: 'AI that roasts (then hypes) your GitHub',
    badge: 'Live · reporoast-alpha.vercel.app',
    href: 'https://reporoast-alpha.vercel.app',
    description:
      'A fun AI web app: drop in a GitHub username and an AI roast host delivers a savage-but-kind roast of your repos, then flips to a genuine hype-up — with a 0–100 heat score and a shareable card. Public GitHub data in, Claude Haiku out, no login, nothing stored. Built in a day as the fun counterweight to my security work.',
    tags: ['React', 'Vite', 'Claude API', 'GitHub API', 'Design'],
  },
  {
    name: 'SlideStack',
    repo: 'slidestack',
    tagline: 'AI Instagram carousel maker — topic in, PNGs out',
    badge: 'Live · slidestack-beta.vercel.app',
    href: 'https://slidestack-beta.vercel.app',
    description:
      'Carousels beat Reels in 2026 (saved ~9× more), so I built the fastest way to make one: type a topic, Claude Fable 5 writes a hook → points → CTA deck as structured JSON, and a canvas renderer paints 1080×1350 slides in three hand-built themes — downloadable as PNGs or a ZIP. 100% client-side BYOK: your API key never leaves the browser, enforced by a strict CSP.',
    tags: ['React', 'Vite', 'TypeScript', 'Claude API', 'Canvas'],
  },
  {
    name: 'PromptProbe',
    repo: 'promptprobe',
    tagline: 'BYOK LLM security scanner — red-teams your chatbot',
    badge: 'Live · promptprobe.vercel.app',
    href: 'https://promptprobe.vercel.app',
    description:
      'A security scanner for LLMs, not code: paste your chatbot\'s API key and PromptProbe fires ~20 adversarial prompts across the OWASP LLM Top 10 — prompt injection, jailbreaks, system-prompt leaks, PII extraction — then an AI judge grades every response and returns a severity-weighted A–F score with a shareable scorecard. Your key is used server-side for one scan and never stored.',
    tags: ['React', 'Vite', 'TypeScript', 'AI Security', 'OWASP LLM'],
  },
  {
    name: 'VulnScan',
    repo: 'vulnscan',
    tagline: 'OWASP Top 10 static analysis scanner',
    badge: 'Live · v1',
    href: 'https://vulnscan-xi.vercel.app/',
    description:
      'An AI security scanner that catches OWASP Top 10 vulnerabilities before they catch you. Paste code or drop a GitHub repo link and get a real vulnerability report in seconds — auto-detects 12 languages, no login, no friction.',
    tags: ['React', 'Vite', 'Static Analysis', 'OWASP', 'Vercel'],
  },
  {
    name: 'etf-research-mcp',
    repo: 'etf-research-mcp',
    tagline: 'Published MCP server for live ETF research',
    badge: 'npm · published',
    href: 'https://www.npmjs.com/package/etf-research-mcp',
    description:
      'An open-source MCP server that gives Claude real-time ETF research tools — installable by anyone in one line, no API key required. 7 tools covering theme search, live quotes, expense ratios, AUM, top holdings, side-by-side comparisons, and 5-year performance.',
    tags: ['TypeScript', 'MCP', 'Node', 'Finance'],
  },
  {
    name: 'keyhound',
    repo: 'keyhound',
    tagline: 'Dependency-free Python secret scanner',
    badge: 'GitHub · CLI',
    href: 'https://github.com/myanptl/keyhound',
    description:
      'A zero-dependency Python CLI that scans codebases and full git history for leaked API keys and secrets. Detects 25+ credential types plus high-entropy strings, scans deleted commits, redacts findings, and ships CI-ready exit codes. Built after I found a leaked key in my own project.',
    tags: ['Python', 'Cybersecurity', 'CLI', 'Open Source'],
  },
  {
    name: 'EquityLens — AMZN Pitch',
    tagline: 'Self-built stock/ETF scoring tool',
    badge: 'Case study',
    href: 'https://github.com/myanptl',
    description:
      'A stock-scoring tool I built (Valuation 40 / Earnings 25 / Insider 20 / Attention 15), used to produce a full Amazon (AMZN) equity pitch rated Buy — walking through AWS + AI growth, valuation, and risks with real June 2026 numbers. Educational, not investment advice.',
    tags: ['React', 'Finance', 'Data Viz', 'Research'],
  },
];

export const skills = [
  { group: 'Frontend', items: ['React', 'Vite', 'JavaScript', 'TypeScript', 'CSS'] },
  { group: 'Backend & Data', items: ['Supabase', 'Node', 'Edge Functions', 'Python'] },
  { group: 'AI', items: ['Claude API', 'MCP', 'Prompt Engineering', 'AI Agents'] },
  { group: 'Security', items: ['OWASP Top 10', 'Secret Scanning', 'Security Audits'] },
  { group: 'Tools', items: ['Claude Code', 'Git / GitHub', 'Vercel', 'VS Code'] },
];

export const credentials = {
  certifications: {
    headline: '18 Anthropic Academy Certifications',
    detail:
      'Completed the full Anthropic Academy track — AI Fluency (Students, Nonprofits, Small Business), Introduction to Subagents & Agent Skills, Model Context Protocol: Advanced Topics, Claude with Amazon Bedrock, Claude with Google Cloud Vertex AI, and more.',
  },
  volunteering: {
    org: 'American India Foundation',
    role: 'Fundraising Volunteer / Youth Ambassador',
    meta: 'Apr 2025 – Present',
    detail:
      "Raise awareness and support for AIF's Digital Equalizer program, bringing technology and STEM education to underserved schools across India. Attended the AIF New England Appreciation Gala 2026, where Governor Maura Healey declared May 9th as AIF Day.",
  },
};
