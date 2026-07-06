import { useCodeTyper } from '../../hooks/useCodeTyper';
import { iconMap } from '../layout/Icons';
import { profile } from '../../data/profile';
import './hero.css';

/* The hero types this file out. Token types map to the site palette:
   kw = keyword (raspberry) · en = entity (violet) · str = string (amber)
   pn = punctuation (dim ink) · cm = comment (mauve) */
const CODE_LINES = [
  [
    { text: 'const ', type: 'kw' },
    { text: 'myan', type: 'en' },
    { text: ' = {', type: 'pn' },
  ],
  [
    { text: '  role', type: 'pr' },
    { text: ': ', type: 'pn' },
    { text: '"GenAI product × AI security"', type: 'str' },
    { text: ',', type: 'pn' },
  ],
  [
    { text: '  school', type: 'pr' },
    { text: ': ', type: 'pn' },
    { text: '"Westford Academy \'28"', type: 'str' },
    { text: ',', type: 'pn' },
  ],
  [
    { text: '  ships', type: 'pr' },
    { text: ': [', type: 'pn' },
    { text: '"FocusOS"', type: 'str' },
    { text: ', ', type: 'pn' },
    { text: '"PromptProbe"', type: 'str' },
    { text: ',', type: 'pn' },
  ],
  [
    { text: '    "SlideStack"', type: 'str' },
    { text: ', …], ', type: 'pn' },
    { text: '// 8 live', type: 'cm' },
  ],
  [
    { text: '  certified', type: 'pr' },
    { text: ': ', type: 'pn' },
    { text: '"Anthropic Academy × 18"', type: 'str' },
    { text: ',', type: 'pn' },
  ],
  [
    { text: '  status', type: 'pr' },
    { text: ': ', type: 'pn' },
    { text: '"building"', type: 'str' },
    { text: ',', type: 'pn' },
  ],
  [{ text: '};', type: 'pn' }],
  [{ text: '' }],
  [
    { text: 'export default ', type: 'kw' },
    { text: 'myan', type: 'en' },
    { text: ';', type: 'pn' },
  ],
];

function TypedCode({ lines, revealed, done }) {
  let cursor = 0;
  return (
    <pre className="hero-code" aria-hidden="true">
      {lines.map((line, i) => {
        const lineStart = cursor;
        const parts = line.map((tok, j) => {
          const start = cursor;
          cursor += tok.text.length;
          const visible = Math.max(
            0,
            Math.min(tok.text.length, revealed - start)
          );
          if (visible === 0) return null;
          return (
            <span key={j} className={tok.type ? `hc-${tok.type}` : undefined}>
              {tok.text.slice(0, visible)}
            </span>
          );
        });
        const lineEnd = cursor;
        const lineActive = !done && revealed >= lineStart && revealed < lineEnd;
        return (
          <span className="hero-code-line" key={i}>
            <span className="hero-code-no">{String(i + 1).padStart(2, '0')}</span>
            <span className="hero-code-src">
              {parts}
              {lineActive && <span className="code-caret" />}
            </span>
          </span>
        );
      })}
    </pre>
  );
}

export function CodeHero() {
  const { revealed, done } = useCodeTyper(CODE_LINES, { speed: 18 });

  return (
    <header className="hero section" aria-label="Introduction">
      <div className="container hero-grid">
        <div className="hero-intro">
          <p className="hero-eyebrow tok-comment">
            {'// rising junior. builder. 8 projects live.'}
          </p>
          <h1 className="hero-name">
            Myan
            <br />
            Patel
          </h1>
          <p className="hero-tagline">
            I build and secure AI products end to end — from PRD to prod to
            pentest.
          </p>
          <div className="hero-links">
            {profile.links.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.label}
                  className="hero-link mono"
                  href={link.href}
                  aria-label={link.ariaLabel}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {Icon && <Icon className="hero-link-icon" />}
                  {link.label}
                </a>
              );
            })}
            <a className="hero-link hero-link-primary mono" href="#projects">
              ./projects ↓
            </a>
          </div>
        </div>

        <div className="hero-editor sheet" role="img" aria-label="Code snippet describing Myan: GenAI product and AI security, Westford Academy class of 2028, 8 shipped projects, 18 Anthropic certifications.">
          <div className="hero-editor-bar">
            <span className="hero-tab mono">
              myan.config.ts
              {!done && <span className="hero-tab-dot" aria-hidden="true" />}
            </span>
          </div>
          <TypedCode lines={CODE_LINES} revealed={revealed} done={done} />
        </div>
      </div>
    </header>
  );
}
