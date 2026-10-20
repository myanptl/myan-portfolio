// Everything the datasheet measures. `url` is probed live from the visitor's
// browser; `repo` is read from GitHub; `npm` is read from the npm registry.
// `what` is what the thing IS, in six words or fewer.

export const OWNER = 'myanptl';

export const systems = [
  { id: 'focusos', name: 'FocusOS', what: 'AI study app', url: 'https://focusos.live', repo: 'focusos' },
  { id: 'nye', name: 'NYE Media', what: 'Nonprofit for student builders', url: 'https://nyemedia.org' },
  { id: 'vulnscan', name: 'VulnScan', what: 'OWASP Top 10 scanner', url: 'https://vulnscan-xi.vercel.app', repo: 'vulnscan' },
  { id: 'promptprobe', name: 'PromptProbe', what: 'LLM red-teaming scanner', url: 'https://promptprobe.vercel.app', repo: 'promptprobe' },
  { id: 'slideair', name: 'SlideAir', what: 'Gesture-controlled presenting', url: 'https://slideair.vercel.app', repo: 'slideair' },
  { id: 'slidestack', name: 'SlideStack', what: 'AI carousel maker', url: 'https://slidestack-beta.vercel.app', repo: 'slidestack' },
  { id: 'reporoast', name: 'RepoRoast', what: 'AI that roasts your GitHub', url: 'https://reporoast-alpha.vercel.app', repo: 'reporoast' },
];

export const packages = [
  { name: 'etf-research-mcp', what: 'Live ETF data for Claude' },
  { name: 'golive-mcp', what: 'Checks a site before you share it' },
  { name: 'housestyle-mcp', what: 'Audits CSS for AI-built tells' },
  { name: 'fable-jarvis', what: 'Read-only terminal assistant' },
];

export const links = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/myan-patel-1857943ba/' },
  { label: 'GitHub', href: `https://github.com/${OWNER}` },
];
