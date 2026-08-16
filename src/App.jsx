import { Hero } from './components/hero/Hero';
import { Statement } from './components/statement/Statement';
import { WorkIndex } from './components/index/WorkIndex';
import { Marquee } from './components/marquee/Marquee';
import { Experience } from './components/experience/Experience';
import { Credentials } from './components/credentials/Credentials';
import { Contact } from './components/contact/Contact';
import { StickyHeader } from './components/layout/StickyHeader';
import { Instrument } from './components/layout/Instrument';
import { usePolarity } from './hooks/usePolarity';
import { useSmoothScroll } from './hooks/useSmoothScroll';

export default function App() {
  useSmoothScroll();
  const { label } = usePolarity();

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to the work
      </a>

      <Instrument />
      <StickyHeader label={label} />

      <div id="top">
        <Hero />

        <main id="main-content">
          <Statement />

          {/* The work is a typographic index; hovering a row floats that
              project's capture whole beside the pointer. */}
          <div id="work">
            <WorkIndex />
          </div>

          <Marquee />
          <Experience />
          <Credentials />
        </main>

        <Contact />
      </div>
    </>
  );
}
