import { useEffect, useState } from 'react';
import { useChrome } from '../../hooks/useChrome';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { KineticText } from '../common/KineticText';
import { Scramble } from '../common/Scramble';
import './hero.css';

/**
 * The landing.
 *
 * Arrival is choreographed rather than instant: the rules draw themselves out,
 * the headline rises character by character out of its line masks, and the
 * meta and footer come up last. Nothing on the page moved on load before this,
 * which is what made it read as a static block of text.
 */
export function Hero() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useChrome({ reducedMotion });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setReady(true);
      return;
    }
    // One frame's grace so the transitions have a start value to run from.
    const t = setTimeout(() => setReady(true), 40);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  return (
    <section
      className={`hero ${ready ? 'is-ready' : ''}`}
      data-polarity="dark"
      data-section="index"
    >
      {/* The chrome runs the full width behind the type as atmosphere, and the
          lettering itself carries the polished surface. */}
      <div className="hero__fieldWrap" aria-hidden="true">
        <canvas ref={canvasRef} className="hero__field" />
      </div>

      <div className="hero__inner shell">
        <header className="hero__top">
          <Scramble as="p" className="label" text="Myan Patel" />
          <Scramble as="p" className="label" text="Product & security" />
          <Scramble as="p" className="label hero__where" text="Westford, Massachusetts" />
        </header>

        <h1 className="hero__display">
          <KineticText
            className="chrome-text"
            lines={['Build and', 'secure AI', 'products.']}
            delay={280}
            stagger={24}
            reducedMotion={reducedMotion}
          />
        </h1>

        <footer className="hero__foot">
          <p className="hero__bio">
            Rising junior at Westford Academy. I take products the whole way,
            then run them through the OWASP Top 10 myself.
          </p>
          <p className="label hero__scroll">
            <span>Scroll</span>
            <span className="hero__rule" aria-hidden="true" />
          </p>
        </footer>
      </div>
    </section>
  );
}
