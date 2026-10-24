import { Hero } from './components/hero/Hero';
import { Teardown } from './components/teardown/Teardown';
import { Contact } from './components/contact/Contact';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useTeardown } from './hooks/useTeardown';

export default function App() {
  useSmoothScroll();
  useTeardown();

  return (
    <>
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
        </main>
        <Contact />
      </div>
    </>
  );
}
