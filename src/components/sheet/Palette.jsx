import { useEffect, useMemo, useRef, useState } from 'react';
import { systems, packages, links } from '../../data/systems';
import { toggleTheme } from '../../lib/theme';

// Command palette on Cmd/Ctrl+K or "/". A native <dialog> gives focus
// trapping and Escape for free.

const open = (href) => window.open(href, '_blank', 'noopener');

const COMMANDS = [
  ...systems.map((s) => ({ id: s.id, label: s.name, hint: s.what, run: () => open(s.url) })),
  ...packages.map((p) => ({ id: p.name, label: p.name, hint: 'npm', run: () => open(`https://www.npmjs.com/package/${p.name}`) })),
  ...links.map((l) => ({ id: l.label, label: `Open ${l.label}`, hint: 'profile', run: () => open(l.href) })),
  { id: 'theme', label: 'Switch light and dark', hint: 'T', run: toggleTheme },
];

export function Palette({ openRef }) {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? COMMANDS.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(q)) : COMMANDS;
  }, [query]);

  const show = () => { setQuery(''); setActive(0); dialogRef.current?.showModal(); };
  const close = () => dialogRef.current?.close();
  openRef.current = show;

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        show();
      } else if (e.key === 't' && !typing && !e.metaKey && !e.ctrlKey && !dialogRef.current?.open) {
        toggleTheme();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const run = (cmd) => { close(); cmd?.run(); };

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); run(results[active]); }
  };

  return (
    <dialog ref={dialogRef} className="palette" aria-label="Command menu" onClick={(e) => { if (e.target === dialogRef.current) close(); }}>
      <input
        className="palette__input"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setActive(0); }}
        onKeyDown={onInputKey}
        placeholder="Jump to a system, package or profile"
        aria-label="Search commands"
        autoFocus
      />
      <ul className="palette__list" role="listbox">
        {results.map((c, i) => (
          <li key={c.id} role="option" aria-selected={i === active}>
            <button type="button" onMouseEnter={() => setActive(i)} onClick={() => run(c)}>
              <span>{c.label}</span>
              <span className="palette__hint">{c.hint}</span>
            </button>
          </li>
        ))}
        {!results.length && <li className="palette__empty">Nothing matches "{query}".</li>}
      </ul>
    </dialog>
  );
}
