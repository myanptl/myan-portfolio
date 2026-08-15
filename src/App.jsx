import { Hero } from './components/hero/Hero';
import { Statement } from './components/statement/Statement';
import { WorkGrid } from './components/work/WorkGrid';
import { Takeover } from './components/work/Takeover';
import { Credentials } from './components/credentials/Credentials';
import { Marquee } from './components/marquee/Marquee';
import { Record } from './components/record/Record';
import { Contact } from './components/contact/Contact';
import { StickyHeader } from './components/layout/StickyHeader';
import { Instrument } from './components/layout/Instrument';
import { usePolarity } from './hooks/usePolarity';
import { takeovers, workA, workB, workC, workD } from './data/work';

export default function App() {
  const { label } = usePolarity();

  return (
    <>
      <a className="skip-link" href="#the-record">
        Skip to the full record
      </a>

      <Instrument />
      <StickyHeader label={label} />

      <div id="top">
        <Hero />

        <main id="main-content">
          <Statement />

          {/* Uniform grids and full-bleed takeovers alternate. The grids keep
              every card the same size; the takeovers pan a whole site through
              a window as you scroll past. */}
          <WorkGrid items={workA} />
          <Takeover item={takeovers[0]} index={1} eager />

          <WorkGrid items={workB} />
          <Takeover item={takeovers[1]} index={2} />

          <WorkGrid items={workC} />
          <Takeover item={takeovers[2]} index={3} />

          <WorkGrid items={workD} />

          <Credentials />

          <Marquee />

          <div id="the-record">
            <Record />
          </div>
        </main>

        <Contact />
      </div>
    </>
  );
}
