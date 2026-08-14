import { Hero } from './components/hero/Hero';
import { Statement } from './components/statement/Statement';
import { StaggeredPair } from './components/work/StaggeredPair';
import { Takeover } from './components/work/Takeover';
import { Marquee } from './components/marquee/Marquee';
import { Record } from './components/record/Record';
import { Contact } from './components/contact/Contact';
import { StickyHeader } from './components/layout/StickyHeader';
import { usePolarity } from './hooks/usePolarity';
import { pairs, takeovers } from './data/work';

export default function App() {
  const { label } = usePolarity();

  return (
    <>
      <a className="skip-link" href="#the-record">
        Skip to the full record
      </a>

      <StickyHeader label={label} />

      <div id="top">
        <Hero />

        <main id="main-content">
          <Statement />

          {/* Work alternates: a staggered pair, then a full-bleed takeover, so
              no two consecutive screens share a shape. */}
          <StaggeredPair pair={pairs[0]} />
          <Takeover item={takeovers[0]} index={1} eager />

          <StaggeredPair pair={pairs[1]} />
          <Takeover item={takeovers[1]} index={2} />

          <StaggeredPair pair={pairs[2]} />
          <Takeover item={takeovers[2]} index={3} />

          <StaggeredPair pair={pairs[3]} />

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
