import { useEffect, useState } from 'react';
import { profile } from '../../data/profile';
import { featured, workGroups, workIndex } from '../../data/work';
import { experience, recognition } from '../../data/resume';
import { Mosaic } from './Mosaic';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noopener noreferrer' };
const href = (name) => workIndex.find((w) => w.name === name).href;

function Section({ id, title, children }) {
  return (
    <section className="block" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

// Real downloads for the last 30 days, straight from the npm registry. If the
// request fails the line is simply left out.
function useMonthlyDownloads(pkg) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`https://api.npmjs.org/downloads/point/last-month/${pkg}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && Number.isInteger(d.downloads)) setCount(d.downloads); })
      .catch(() => {});
    return () => ctrl.abort();
  }, [pkg]);
  return count;
}

function Featured() {
  const downloads = useMonthlyDownloads(featured.pkg);
  return (
    <a className="featured" href={featured.href} {...ext}>
      <span className="featured__label">Most used</span>
      <span className="featured__name">{featured.name}<span className="featured__arrow" aria-hidden="true">↗</span></span>
      <span className="featured__desc">{featured.desc}</span>
      <span className="featured__meta">
        {downloads !== null && <span>{downloads.toLocaleString('en-US')} downloads in the last 30 days</span>}
        <span>npm, MIT</span>
      </span>
    </a>
  );
}

export function Home() {
  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Myan <em>Patel</em></h1>
          <p className="page__tagline">AI products and the security around them</p>
        </div>
        <ThemeToggle />
      </header>

      <aside className="page__art">
        <Mosaic />
      </aside>

      <main className="page__body">
        <div className="intro">
          <p>
            I'm a junior at Westford Academy in Massachusetts. I build AI products end to end, then
            test them the way an attacker would. Right now that's{' '}
            <a href={href('FocusOS')} {...ext}>FocusOS</a>, a study app built around a real attention
            span, and the technical side of <a href={href('NYE Media')} {...ext}>NYE Media</a>, the
            nonprofit I co-founded for high school builders.
          </p>
        </div>

        <Featured />

        <Section id="work" title="Work">
          {workGroups.map((g) => (
            <div className="group" key={g.id}>
              <h3>{g.title}</h3>
              <ul className="rows">
                {workIndex.filter((w) => w.group === g.id).map((w) => (
                  <li key={w.name}>
                    <a className="row row--work" href={w.href} {...ext}>
                      <span className="row__name">{w.name}</span>
                      <span className="row__desc">{w.role}</span>
                      <span className="row__meta">{w.at}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        <Section id="experience" title="Experience">
          <ul className="rows">
            {experience.map((e) => {
              const body = (
                <>
                  <span className="row__meta">{e.when}</span>
                  <span className="row__name">{e.role}</span>
                  <span className="row__desc">{e.org}</span>
                </>
              );
              return (
                <li key={`${e.org}-${e.role}`}>
                  {e.href ? <a className="row row--dated" href={e.href} {...ext}>{body}</a> : <div className="row row--dated">{body}</div>}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="recognition" title="Programs and recognition">
          <ul className="rows">
            {recognition.map((r) => (
              <li key={r.what}>
                <div className="row row--dated">
                  <span className="row__meta">{r.when}</span>
                  <span className="row__name">{r.what}</span>
                  <span className="row__desc">{r.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <footer className="page__foot">
          <ul className="page__links">
            {profile.links.map((l) => (
              <li key={l.label}><a href={l.href} {...ext}>{l.label.toLowerCase()}</a></li>
            ))}
          </ul>
          <span>{profile.where}</span>
        </footer>
      </main>
    </div>
  );
}
