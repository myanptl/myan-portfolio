import './header.css';

/** Wordmark plus the name of whatever section you are currently reading. */
export function StickyHeader({ label }) {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__mark" href="#top">
          MP<span aria-hidden="true">.</span>
        </a>
        <p className="label header__label" aria-live="polite">
          {label}
        </p>
        <a className="label header__link" href="#the-record">
          The Record
        </a>
      </div>
    </header>
  );
}
