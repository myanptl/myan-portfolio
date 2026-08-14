import { useHalftone } from '../../hooks/useHalftone';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './hero.css';

const WORDMARK = 'myan patel.';

export function Hero() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useHalftone({ reducedMotion });

  return (
    <section className="hero" data-polarity="dark" data-section="index">
      <canvas ref={canvasRef} className="hero__field" aria-hidden="true" />

      <div className="hero__inner shell">
        <p className="label hero__kicker">
          <span>Westford, MA</span>
          <span>Class of 2028</span>
        </p>

        <h1 className="hero__wordmark" aria-label={WORDMARK}>
          {WORDMARK.split('').map((char, i) => (
            <span
              key={`${char}-${i}`}
              className="hero__char"
              style={{ '--i': i }}
              aria-hidden="true"
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </h1>

        <div className="hero__foot">
          <p className="hero__role">
            I build AI products, then try to break them.
          </p>
          <p className="label hero__count">( 11 shipped )</p>
        </div>
      </div>
    </section>
  );
}
