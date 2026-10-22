import { profile } from '../../data/profile';
import { Mosaic } from './Mosaic';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

// The jeffreylin.dev template, kept to the pixel: one column, the picture on
// top, two short paragraphs, links at the foot.
export function Home() {
  return (
    <div className="page">
      <div className="page__col">
        <header className="page__head">
          <h1>{profile.name}</h1>
          <ThemeToggle />
        </header>

        <main className="page__main">
          <Mosaic />
          <p className="page__p page__p--first">
            I'm a junior at Westford Academy in Massachusetts, building{' '}
            <a href="https://focusos.live" {...ext}>FocusOS</a>, a study app. I also co-founded{' '}
            <a href="https://nyemedia.org" {...ext}>NYE Media</a>, a nonprofit that connects high
            school builders with founders and mentors.
          </p>
          <p className="page__p">
            Previously, I interned at <a href="https://dimenso.ai" {...ext}>Dimenso</a>. I also
            made <a href="https://www.npmjs.com/package/etf-research-mcp" {...ext}>etf-research-mcp</a>,
            which gives Claude live ETF data and has over 1,000 downloads.
          </p>
        </main>

        <footer className="page__foot">
          {profile.links.map((l) => (
            <a key={l.label} href={l.href} {...ext}>{l.label.toLowerCase()}</a>
          ))}
        </footer>
      </div>
    </div>
  );
}
