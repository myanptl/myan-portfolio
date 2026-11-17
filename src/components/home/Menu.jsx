import { useEffect, useRef, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');

// Burger in the header. Opens a small panel listing the pages; picking one
// changes the hash, which closes the panel. Escape or a click outside closes it too.
export function Menu({ sections, current }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const button = useRef(null);

  useEffect(() => { setOpen(false); }, [current]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current.focus();
    };
    const onDown = (e) => { if (!wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div className="menu" ref={wrap}>
      <button
        ref={button}
        type="button"
        className={open ? 'menu__btn is-open' : 'menu__btn'}
        aria-expanded={open}
        aria-controls="menu-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>
      {open && (
        <nav id="menu-panel" className="menu__panel" aria-label="Pages">
          <ul>
            <li>
              <a href="#/" aria-current={current ? undefined : 'page'} onClick={() => setOpen(false)}>
                <span className="menu__idx" aria-hidden="true">00</span>Home
              </a>
            </li>
            {sections.map((s, i) => (
              <li key={s.slug}>
                <a href={`#/${s.slug}`} aria-current={current === s.slug ? 'page' : undefined} onClick={() => setOpen(false)}>
                  <span className="menu__idx" aria-hidden="true">{pad(i + 1)}</span>{s.title}
                  <span className="menu__count" aria-hidden="true">{pad(s.rows.length)}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
