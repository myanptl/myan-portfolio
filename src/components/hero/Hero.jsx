import { useLiquidMetal } from '../../hooks/useLiquidMetal';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { RevealText } from '../common/RevealText';
import './hero.css';

export function Hero() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useLiquidMetal({ reducedMotion });

  return (
    <section className="hero" data-polarity="dark" data-section="index">
      {/* The canvas bleeds past the section edges, so the clipping lives on its
          own wrapper. Putting overflow:hidden on the section itself also
          sheared the hero's own text when the content ran taller than the
          viewport. */}
      <div className="hero__fieldWrap" aria-hidden="true">
        <canvas ref={canvasRef} className="hero__field" />
      </div>

      <div className="hero__inner shell">
        <header className="hero__top">
          <p className="label">Myan Patel</p>
          <p className="label">Product & security</p>
          <p className="label hero__where">Westford, Massachusetts</p>
        </header>

        <h1 className="hero__display">
          <RevealText text="Build and secure" delay={120} stagger={70} />
          <RevealText text="AI products." delay={260} stagger={70} />
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
