import { profile } from '../../data/profile';
import { workIndex } from '../../data/work';
import { Mosaic } from './Mosaic';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noreferrer' };
const href = (name) => workIndex.find((w) => w.name === name).href;

export function Home() {
  return (
    <div className="home">
      <header className="home__head">
        <h1 className="home__name">{profile.name}</h1>
        <ThemeToggle />
      </header>

      <main>
        <Mosaic />

        <section className="home__bio" aria-label="About">
          <p>
            I'm a junior at Westford Academy in Massachusetts. I build AI products and then try to
            break them. Right now that's <a href={href('FocusOS')} {...ext}>FocusOS</a>, a study app
            built around a real attention span, and the technical side
            of <a href={href('NYE Media')} {...ext}>NYE Media</a>, the nonprofit I co-founded for
            high school builders.
          </p>
          <p>
            On the security side I've shipped <a href={href('VulnScan')} {...ext}>VulnScan</a>, an
            OWASP Top 10 scanner, and <a href={href('PromptProbe')} {...ext}>PromptProbe</a>, which
            red-teams LLM apps. The picture above is one of the motion pieces I render in code. Click it for the next.
          </p>
        </section>

        <section className="home__work" aria-labelledby="work-h">
          <h2 id="work-h" className="label">Work</h2>
          <ul>
            {workIndex.map((w) => (
              <li key={w.name}>
                <a href={w.href} {...ext}>
                  <span className="work__name">{w.name}</span>
                  <span className="work__role">{w.role}</span>
                  <span className="work__at">{w.at}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="home__foot">
        <ul>
          {profile.links.map((l) => (
            <li key={l.label}><a href={l.href} {...ext}>{l.label.toLowerCase()}</a></li>
          ))}
        </ul>
        <span className="label">{profile.where}</span>
      </footer>
    </div>
  );
}
