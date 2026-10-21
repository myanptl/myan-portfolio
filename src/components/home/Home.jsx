import { profile } from '../../data/profile';
import { workGroups, workIndex } from '../../data/work';
import { experience, recognition } from '../../data/resume';
import { Mosaic } from './Mosaic';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noreferrer' };
const href = (name) => workIndex.find((w) => w.name === name).href;

function Section({ id, title, children }) {
  return (
    <section className="block" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

export function Home() {
  return (
    <main className="home">
      <header className="home__head">
        <div>
          <h1>{profile.name}</h1>
          <p className="home__tagline">AI products and the security around them</p>
        </div>
        <ThemeToggle />
      </header>

      <Mosaic />

      <div className="home__intro">
        <p>
          I'm a junior at Westford Academy in Massachusetts. I build AI products end to end, then
          test them the way an attacker would. Right now that's{' '}
          <a href={href('FocusOS')} {...ext}>FocusOS</a>, a study app built around a real attention
          span, and the technical side of <a href={href('NYE Media')} {...ext}>NYE Media</a>, the
          nonprofit I co-founded for high school builders.
        </p>
      </div>

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

      <footer className="home__foot">
        <ul className="home__links">
          {profile.links.map((l) => (
            <li key={l.label}><a href={l.href} {...ext}>{l.label.toLowerCase()}</a></li>
          ))}
        </ul>
        <span>{profile.where}</span>
      </footer>
    </main>
  );
}
