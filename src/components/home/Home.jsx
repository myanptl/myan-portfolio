import { profile } from '../../data/profile';
import { workIndex } from '../../data/work';
import { Bloom } from './Bloom';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noreferrer' };
const href = (name) => workIndex.find((w) => w.name === name).href;

export function Home() {
  return (
    <div className="home">
      <div className="home__text">
        <header className="home__head">
          <span className="label">{profile.where}</span>
          <ThemeToggle />
        </header>

        <main className="home__main">
          <h1 className="home__name">Myan <em>Patel</em></h1>

          <p className="home__bio rise">
            Junior at Westford Academy. I build AI products, then try to break them.
            Right now: <a href={href('FocusOS')} {...ext}>FocusOS</a>, a study app built around a
            real attention span, and the tech side of <a href={href('NYE Media')} {...ext}>NYE Media</a>,
            a nonprofit I co-founded for high school builders.
          </p>

          <section className="home__work rise" aria-labelledby="work-h">
            <h2 id="work-h" className="label">Work</h2>
            <ul>
              {workIndex.map((w, i) => (
                <li key={w.name} style={{ '--i': i }}>
                  <a href={w.href} {...ext}>
                    <span className="work__name">{w.name}<span className="work__arrow" aria-hidden="true">&#8599;</span></span>
                    <span className="work__role">{w.role}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer className="home__foot rise">
          <ul>
            {profile.links.map((l) => (
              <li key={l.label}><a href={l.href} {...ext}>{l.label}</a></li>
            ))}
          </ul>
          <span className="label">Footage via Pexels</span>
        </footer>
      </div>

      <Bloom />
    </div>
  );
}
