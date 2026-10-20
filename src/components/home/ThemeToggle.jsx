import { useEffect, useState } from 'react';

const KEY = 'theme';

const stored = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

// null means "follow the system". The CSS handles that case on its own.
export function ThemeToggle() {
  const [theme, setTheme] = useState(stored);

  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.dataset.theme = theme;
    else delete root.dataset.theme;
    try { theme ? localStorage.setItem(KEY, theme) : localStorage.removeItem(KEY); } catch { /* private mode */ }
  }, [theme]);

  const isDark = () => theme
    ? theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(isDark() ? 'light' : 'dark')}
      aria-label="Switch between light and dark"
    >
      <span className="theme-toggle__dot" aria-hidden="true" />
    </button>
  );
}
