import { useTypewriter } from '../../hooks/useTypewriter';
import { iconMap } from '../layout/Icons';
import { profile } from '../../data/profile';
import { InteractiveTerm } from './InteractiveTerm';
import './terminal.css';

const PROMPT = 'myan@web:~$';

const STEPS = [
  { key: 'whoami', command: 'whoami' },
  { key: 'about', command: 'cat about.txt' },
  { key: 'links', command: 'ls ./links/' },
];

// Hoisted to module scope so its identity is stable across re-renders
// (the typewriter fires setState ~every 55ms during the intro animation).
function Line({ stepKey, typed, activeKey }) {
  return (
    <span className="term-command-line">
      <span className="term-prompt mono">{PROMPT}</span>{' '}
      <span className="term-command mono">{typed[stepKey] ?? ''}</span>
      {activeKey === stepKey && <span className="blink-cursor" aria-hidden="true">▋</span>}
    </span>
  );
}

export function TerminalHero() {
  const { typed, doneSteps, activeKey } = useTypewriter(STEPS);

  return (
    <header className="hero section" aria-label="Introduction">
      <div className="container hero-grid">
        <div className="terminal">
          <div className="terminal-bar" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-amber" />
            <span className="dot dot-green" />
            <span className="terminal-title mono">myan@web — zsh — 80x24</span>
          </div>

          <div className="terminal-body">
            <p className="term-login mono">Last login: today on ttys001</p>

            {/* whoami */}
            <Line stepKey="whoami" typed={typed} activeKey={activeKey} />
            {doneSteps.has('whoami') && (
              <div className="term-output term-whoami" aria-live="polite" aria-atomic="true">
                <span className="term-greeting mono">Hey there, I&apos;m</span>
                <h1 className="term-name">{profile.name}</h1>
              </div>
            )}

            {/* cat about.txt */}
            {(activeKey === 'about' || doneSteps.has('about')) && (
              <Line stepKey="about" typed={typed} activeKey={activeKey} />
            )}
            {doneSteps.has('about') && (
              <div className="term-output term-about">
                {profile.about.map((line, i) => (
                  <p key={line} className={i === 0 ? 'about-lead' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* ls ./links/ */}
            {(activeKey === 'links' || doneSteps.has('links')) && (
              <Line stepKey="links" typed={typed} activeKey={activeKey} />
            )}
            {doneSteps.has('links') && (
              <div className="term-output term-links">
                {profile.links.map((link) => {
                  const Icon = iconMap[link.icon];
                  const external = link.href.startsWith('http');
                  return (
                    <a
                      key={link.label}
                      className="link-chip mono"
                      href={link.href}
                      aria-label={link.ariaLabel}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                    >
                      {Icon && <Icon className="chip-icon" />}
                      {link.label}
                    </a>
                  );
                })}
              </div>
            )}

            {/* the prompt goes live once the intro finishes */}
            {activeKey === null && doneSteps.has('links') && <InteractiveTerm />}
          </div>
        </div>

        <a className="scroll-cue mono" href="#projects" aria-label="Scroll to projects">
          <span>scroll</span>
          <span className="scroll-cue-arrow" aria-hidden="true">↓</span>
        </a>
      </div>
    </header>
  );
}
