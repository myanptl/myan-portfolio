import { useEffect, useRef, useState } from 'react';
import { profile, projects, skills, credentials } from '../../data/profile';
import { useGithubStats } from '../../hooks/useGithubStats';

const PROMPT = 'myan@web:~$';

const HELP = [
  ['help', 'this menu'],
  ['projects', 'list everything I have shipped'],
  ['open <name>', 'launch a project (try: open slidestack)'],
  ['gh', 'live GitHub stats'],
  ['skills', 'the stack'],
  ['certs', 'certifications'],
  ['contact', 'where to find me'],
  ['clear', 'wipe the screen'],
];

function projectSlug(p) {
  return (p.repo || p.name).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function InteractiveTerm() {
  const [history, setHistory] = useState([]);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const stats = useGithubStats();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [history]);

  function print(cmd, lines) {
    setHistory((h) => [...h, { cmd, lines }]);
  }

  function run(raw) {
    const input = raw.trim();
    if (!input) return;
    const [cmd, ...rest] = input.toLowerCase().split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd) {
      case 'help':
        print(input, HELP.map(([c, d]) => `${c.padEnd(14)} ${d}`));
        break;
      case 'whoami':
        print(input, [profile.fullName, ...profile.about]);
        break;
      case 'about':
        print(input, profile.about);
        break;
      case 'projects':
      case 'ls':
        print(
          input,
          projects.map((p) => `${projectSlug(p).padEnd(16)} ${p.tagline}`),
        );
        break;
      case 'open': {
        const target = projects.find(
          (p) => projectSlug(p) === arg.replace(/[^a-z0-9]+/g, '') && p.href,
        );
        if (target) {
          window.open(target.href, '_blank', 'noopener,noreferrer');
          print(input, [`opening ${target.name} → ${target.href}`]);
        } else {
          print(input, [`open: unknown project '${arg}' — run 'projects' to see the list`]);
        }
        break;
      }
      case 'gh':
      case 'stats': {
        const entries = Object.entries(stats);
        if (entries.length === 0) {
          print(input, ['fetching github.com/myanptl … try again in a second (or GitHub rate-limited us)']);
        } else {
          const stars = entries.reduce((n, [, r]) => n + (r.stars || 0), 0);
          const langs = [...new Set(entries.map(([, r]) => r.language).filter(Boolean))];
          print(input, [
            `${entries.length} public repos · ${stars} stars · live from the GitHub API`,
            `languages: ${langs.slice(0, 5).join(', ')}`,
          ]);
        }
        break;
      }
      case 'skills':
        print(input, skills.map((g) => `${g.group.padEnd(16)} ${g.items.join(', ')}`));
        break;
      case 'certs':
        print(input, [credentials.certifications.headline, credentials.certifications.detail]);
        break;
      case 'contact':
      case 'links':
        print(input, profile.links.map((l) => `${l.label.padEnd(10)} ${l.href}`));
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'sudo':
        print(input, arg === 'hire-me'
          ? ['[sudo] permission granted.', 'myan.ptl is now on your team. welcome aboard.']
          : ['myan is not in the sudoers file. this incident will be reported.']);
        break;
      case 'roast':
        window.open('https://reporoast-alpha.vercel.app', '_blank', 'noopener,noreferrer');
        print(input, ['deploying comedian → reporoast-alpha.vercel.app']);
        break;
      case 'exit':
        print(input, ["there's no exit. still a sophomore, still shipping."]);
        break;
      default:
        print(input, [`zsh: command not found: ${cmd} — try 'help'`]);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      run(value);
      setValue('');
    }
  }

  return (
    <div className="iterm" onClick={() => inputRef.current?.focus()}>
      <p className="iterm-hint mono"># this terminal is real — type <b>help</b></p>

      <div role="log" aria-live="polite" className="iterm-log">
        {history.map((entry, i) => (
          <div key={i} className="iterm-entry">
            <span className="term-command-line">
              <span className="term-prompt mono">{PROMPT}</span>{' '}
              <span className="term-command mono">{entry.cmd}</span>
            </span>
            {entry.lines.map((line, j) => (
              <p key={j} className="iterm-out mono">{line}</p>
            ))}
          </div>
        ))}
        <span ref={endRef} />
      </div>

      <div className="term-command-line iterm-input-row">
        <span className="term-prompt mono">{PROMPT}</span>{' '}
        <input
          ref={inputRef}
          className="iterm-input mono"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Terminal command input — type help for available commands"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          enterKeyHint="send"
        />
      </div>
    </div>
  );
}
