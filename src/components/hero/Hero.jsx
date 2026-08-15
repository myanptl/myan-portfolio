import { useChrome } from '../../hooks/useChrome';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { RevealText } from '../common/RevealText';
import { Scramble } from '../common/Scramble';
import './hero.css';

export function Hero() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useChrome({ reducedMotion });

  return (
    <section className="hero" data-polarity="dark" data-section="index">
      {/* The chrome is no longer a blob parked in the corner. It runs the full
          width behind the type as atmosphere, and the lettering itself carries
          the polished surface. */}
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
          <RevealText className="chrome-text" text="Build and secure" delay={120} stagger={70} />
          <RevealText className="chrome-text" text="AI products." delay={260} stagger={70} />
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
