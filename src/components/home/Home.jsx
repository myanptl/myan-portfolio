import { profile } from '../../data/profile';
import { workIndex } from '../../data/work';
import { Mosaic } from './Mosaic';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noreferrer' };
const href = (name) => workIndex.find((w) => w.name === name).href;

export function Home() {
  return (
    <main className="home">
      <section className="home__text">
        <header className="home__head">
          <h1>{profile.name}</h1>
          <ThemeToggle />
        </header>

        <p>
          I'm a junior at Westford Academy in Massachusetts. I build AI products, then try to break
          them. Right now that's <a href={href('FocusOS')} {...ext}>FocusOS</a>, an AI study app, and
          the technical side of <a href={href('NYE Media')} {...ext}>NYE Media</a>, the nonprofit I
          co-founded for high school builders.
        </p>
        <p>
          On the security side I've shipped <a href={href('VulnScan')} {...ext}>VulnScan</a>, an
          OWASP Top 10 scanner, and <a href={href('PromptProbe')} {...ext}>PromptProbe</a>, which
          red-teams LLM apps.
        </p>

        <ul className="home__links">
          {profile.links.map((l) => (
            <li key={l.label}><a href={l.href} {...ext}>{l.label.toLowerCase()}</a></li>
          ))}
        </ul>
      </section>

      <Mosaic />
    </main>
  );
}
