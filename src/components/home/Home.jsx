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
      <Bloom />

      <div className="home__text">
        <header className="home__head">
          <span className="label">{profile.where}</span>
          <ThemeToggle />
        </header>

        <main>
          <h1 className="home__name">
            Myan <em>Patel</em>
          </h1>

          <section className="home__bio reveal" aria-label="About">
            <p>
              I'm a junior at Westford Academy. I build AI products and then try to break them.
            </p>
            <p>
              Right now that's <a href={href('FocusOS')} {...ext}>FocusOS</a>, a study app built
              around a real attention span, and the technical side
              of <a href={href('NYE Media')} {...ext}>NYE Media</a>, the nonprofit I co-founded for
              high school builders. On the security side I've shipped <a href={href('VulnScan')} {...ext}>VulnScan</a> and <a href={href('PromptProbe')} {...ext}>PromptProbe</a>.
            </p>
          </section>

          <section className="home__work reveal" aria-labelledby="work-h">
            <h2 id="work-h" className="label">Selected work</h2>
            <ul>
              {workIndex.map((w, i) => (
                <li key={w.name} style={{ '--i': i }}>
                  <a href={w.href} {...ext}>
                    <span className="work__name">{w.name}</span>
                    <span className="work__role">{w.role}</span>
                    <span className="work__arrow" aria-hidden="true">&#8599;</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer className="home__foot reveal">
          <ul>
            {profile.links.map((l) => (
              <li key={l.label}><a href={l.href} {...ext}>{l.label}</a></li>
            ))}
          </ul>
          <span className="label">Footage via Pexels</span>
        </footer>
      </div>
    </div>
  );
}
