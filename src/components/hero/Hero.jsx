import { useHalftone } from '../../hooks/useHalftone';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './hero.css';

const LINES = ['I BUILD AI', 'PRODUCTS AND', 'THEN I BREAK'];
const LAST = 'THEM';

export function Hero() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useHalftone({ reducedMotion });

  return (
    <section className="hero" data-polarity="dark" data-section="index">
      <canvas ref={canvasRef} className="hero__field" aria-hidden="true" />

      <div className="hero__inner shell">
        <header className="hero__top">
          <p className="label">Myan Patel</p>
          <p className="label hero__frag">
            Shipping in public. Auditing in private.
          </p>
          <p className="label hero__bio">
            Rising junior at Westford Academy. I build generative AI products
            end to end, then run them through the OWASP Top 10 myself. Eleven
            things live.
          </p>
        </header>

        <h1 className="hero__display" aria-label={`${LINES.join(' ')} ${LAST}`}>
          {LINES.map((line, i) => (
            <span key={line} className="hero__line" style={{ '--i': i }} aria-hidden="true">
              {line}
            </span>
          ))}
          <span className="hero__line hero__line--last" style={{ '--i': 3 }} aria-hidden="true">
            {LAST}
            <em className="hero__badge">( 11 shipped )</em>
          </span>
        </h1>
      </div>
    </section>
  );
}
