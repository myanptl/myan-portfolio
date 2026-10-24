import { profile } from '../../data/profile';
import { experience, recognition } from '../../data/resume';
import { etf, workIndex } from '../../data/work';
import { motionSites } from '../../data/motion';
import { useEffect, useRef } from 'react';
import { Mosaic } from './Mosaic';
import { Scramble } from './Scramble';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

const projects = [
  { name: etf.name, role: 'Live ETF data for Claude', meta: 'npm', href: etf.href },
  ...workIndex.map((w) => ({ name: w.name, role: w.role, meta: w.at, href: w.href })),
];

const sections = [
  { title: 'Experience', rows: experience.map((e) => ({ name: e.org, role: e.role, meta: e.when, href: e.href })) },
  { title: 'Projects', rows: projects },
  { title: 'Motion', rows: motionSites.map((m) => ({ name: m.name, role: m.role, meta: 'web', href: m.href })) },
  { title: 'Programs', rows: recognition.map((r) => ({ name: r.what, meta: r.when })) },
];

const clockFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false, timeZoneName: 'short',
});

// Local time in Westford, ticking. Written straight to the DOM once a second.
function Clock() {
  const ref = useRef(null);
  useEffect(() => {
    const tick = () => { ref.current.textContent = clockFmt.format(new Date()); };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <time ref={ref} />;
}

const pad = (n) => String(n).padStart(2, '0');

function Row({ name, role, meta, href }) {
  return (
    <li className={role ? 'row' : 'row row--wide'}>
      {href ? <a className="row__name" href={href} {...ext}>{name}</a> : <span className="row__name">{name}</span>}
      {role && <span className="row__role">{role}</span>}
      <span className="row__meta">{meta}</span>
    </li>
  );
}

// The jeffreylin.dev template: one column, the picture on top, two short
// paragraphs, links. Everything else sits underneath as plain rows.
export function Home() {
  return (
    <div className="page">
      <div className="page__col">
        <header className="page__head">
          <div>
            <Scramble as="h1" text={profile.name} />
            <p className="page__meta">Westford, MA <span aria-hidden="true">/</span> <Clock /></p>
          </div>
          <ThemeToggle />
        </header>

        <main>
          <Mosaic />
          <p className="page__p page__p--first">
            I'm a junior at Westford Academy in Massachusetts. I built{' '}
            <a href="https://focusos.live" {...ext}>FocusOS</a>, a study app, and co-founded{' '}
            <a href="https://nyemedia.org" {...ext}>NYE Media</a>, a nonprofit that connects high
            school builders with founders and mentors.
          </p>
          <p className="page__p">
            Previously, I interned at <a href="https://dimenso.ai" {...ext}>Dimenso</a>. I also
            made <a href={etf.href} {...ext}>etf-research-mcp</a>, which gives Claude live ETF data
            and has over 1,000 downloads.
          </p>

          <nav className="page__foot" aria-label="Elsewhere">
            {profile.links.map((l) => (
              <a key={l.label} href={l.href} {...(l.href.startsWith('http') ? ext : {})}>{l.label.toLowerCase()}</a>
            ))}
          </nav>

          {sections.map((s, i) => (
            <section key={s.title} className="list" aria-labelledby={`h-${s.title}`}>
              <h2 id={`h-${s.title}`}>
                <span><span className="list__idx" aria-hidden="true">{pad(i + 1)}</span> {s.title}</span>
                <span className="list__count" aria-hidden="true">{pad(s.rows.length)}</span>
              </h2>
              <ul>{s.rows.map((r) => <Row key={r.name} {...r} />)}</ul>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
