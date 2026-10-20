// One source of truth for light/dark, shared by the toggle and the command
// palette. A stored choice wins; otherwise the system setting does.
const KEY = 'theme';
const listeners = new Set();
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

const stored = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export function getTheme() {
  return document.documentElement.dataset.theme || (media().matches ? 'dark' : 'light');
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
  listeners.forEach((fn) => fn());
}

export const toggleTheme = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');

export function subscribeTheme(fn) {
  listeners.add(fn);
  const mq = media();
  const onSystem = () => { if (!stored()) fn(); };
  mq.addEventListener('change', onSystem);
  return () => { listeners.delete(fn); mq.removeEventListener('change', onSystem); };
}
