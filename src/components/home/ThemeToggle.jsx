import { useEffect, useState } from 'react';

const KEY = 'theme';

const stored = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const Moon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
const Sun = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

// null means "follow the system". The CSS handles that case on its own.
export function ThemeToggle() {
  const [theme, setTheme] = useState(stored);
  const dark = theme ? theme === 'dark' : systemDark();

  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.dataset.theme = theme;
    else delete root.dataset.theme;
    try { theme ? localStorage.setItem(KEY, theme) : localStorage.removeItem(KEY); } catch { /* private mode */ }
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}
