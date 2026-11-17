import { profile } from '../../data/profile';
import { etf } from '../../data/work';
import { sections, sectionFromHash } from '../../data/sections';
import { useEffect, useRef, useState } from 'react';
import { Menu } from './Menu';
import { Mosaic } from './Mosaic';
import { Scramble } from './Scramble';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

// Which page is open, from the URL hash. Hashes need no server rewrite and the
// back button just works.
function useSection() {
  const [section, setSection] = useState(() => sectionFromHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setSection(sectionFromHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return section;
}

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

function Intro() {
  return (
    <>
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
    </>
  );
}

function SectionPage({ section }) {
  const heading = useRef(null);
  const n = sections.indexOf(section);
  const next = sections[(n + 1) % sections.length];
  useEffect(() => { heading.current.focus({ preventScroll: true }); }, [section]);
  return (
    <section className="sub" aria-labelledby="sub-title">
      <h2 id="sub-title" className="sub__title" ref={heading} tabIndex={-1}>
        <span className="sub__idx" aria-hidden="true">{pad(n + 1)}</span>{section.title}
        <span className="sub__count" aria-hidden="true">{pad(section.rows.length)}</span>
      </h2>
      <ul className="sub__rows">{section.rows.map((r) => <Row key={r.name} {...r} />)}</ul>
      <a className="sub__next" href={`#/${next.slug}`}>Next: {next.title}</a>
    </section>
  );
}

// Home is one screen: the picture, two short paragraphs, links. Everything
// else lives on its own page, reached from the menu.
export function Home() {
  const section = useSection();

  useEffect(() => {
    document.title = section ? `${section.title} | ${profile.name}` : profile.name;
    window.scrollTo(0, 0);
  }, [section]);

  return (
    <div className="page">
      <div className="page__col">
        <header className="page__head">
          <div>
            <h1><a className="page__home" href="#/" aria-label={`${profile.name}, home`}><Scramble text={profile.name} /></a></h1>
            <p className="page__meta">Westford, MA <span aria-hidden="true">/</span> <Clock /></p>
          </div>
          <div className="page__tools">
            <ThemeToggle />
            <Menu sections={sections} current={section?.slug ?? null} />
          </div>
        </header>
        <main>{section ? <SectionPage section={section} /> : <Intro />}</main>
      </div>
    </div>
  );
}
