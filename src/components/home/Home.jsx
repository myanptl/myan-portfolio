import { profile } from '../../data/profile';
import { experience, recognition } from '../../data/resume';
import { etf, workIndex } from '../../data/work';
import { motionSites } from '../../data/motion';
import { Mosaic } from './Mosaic';
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
          <h1>{profile.name}</h1>
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
              <a key={l.label} href={l.href} {...ext}>{l.label.toLowerCase()}</a>
            ))}
          </nav>

          {sections.map((s) => (
            <section key={s.title} className="list" aria-labelledby={`h-${s.title}`}>
              <h2 id={`h-${s.title}`}>{s.title}</h2>
              <ul>{s.rows.map((r) => <Row key={r.name} {...r} />)}</ul>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
