import { Hero } from './components/hero/Hero';
import { Teardown } from './components/teardown/Teardown';
import { Work } from './components/work/Work';
import { Contact } from './components/contact/Contact';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useTeardown } from './hooks/useTeardown';

export default function App() {
  useSmoothScroll();
  useTeardown();

  return (
    <>
      <a className="skip-link" href="#work">Skip to the work</a>

      {/* The object. Fixed behind the page; the stage appends its own canvas
          here on mount. Purely visual, and fully described in the teardown's
          own screen-reader list, so it is hidden from the tree. */}
      <div className="stage" id="stage" aria-hidden="true">
        <div className="stage__hotspots" />
      </div>

      <div className="page">
        <Hero />
        <main>
          <Teardown />
          <Work />
        </main>
        <Contact />
      </div>
    </>
  );
}
