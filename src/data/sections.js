import { experience, recognition } from './resume';
import { etf, workIndex } from './work';
import { motionSites } from './motion';

// The pages behind the menu. Each one is a list of rows: name, what it is,
// and a date or where it lives. The slug is the URL hash: #/projects.
const projects = [
  { name: etf.name, role: 'Live ETF data for Claude', meta: 'npm', href: etf.href },
  ...workIndex.map((w) => ({ name: w.name, role: w.role, meta: w.at, href: w.href })),
];

export const sections = [
  { slug: 'experience', title: 'Experience', rows: experience.map((e) => ({ name: e.org, role: e.role, meta: e.when, href: e.href })) },
  { slug: 'projects', title: 'Projects', rows: projects },
  { slug: 'motion', title: 'Motion', rows: motionSites.map((m) => ({ name: m.name, role: m.role, meta: 'web', href: m.href })) },
  { slug: 'programs', title: 'Programs', rows: recognition.map((r) => ({ name: r.what, meta: r.when })) },
];

// '#/projects' -> the Projects section. Anything else (empty, '#/', a typo) is home.
export function sectionFromHash(hash) {
  const slug = String(hash).replace(/^#\/?/, '').toLowerCase();
  return sections.find((s) => s.slug === slug) ?? null;
}
