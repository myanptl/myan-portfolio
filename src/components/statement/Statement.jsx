import { useSectionInView } from '../../hooks/useSectionInView';
import './statement.css';

const LINES = ['BUILD IT', 'THEN TRY', 'TO BREAK IT'];

export function Statement() {
  const [ref, revealed] = useSectionInView({ threshold: 0.3, once: true });

  return (
    <section
      ref={ref}
      className={`statement ${revealed ? 'is-revealed' : ''}`}
      data-polarity="dark"
      data-section="approach"
    >
      <div className="shell statement__inner">
        <h2 className="statement__body">
          {LINES.map((line, i) => (
            <span key={line} className="statement__line" style={{ '--i': i }}>
              <span>{line}</span>
            </span>
          ))}
        </h2>

        <div className="statement__side">
          <p className="label">( Approach )</p>
          <p className="statement__tail">
            Most people building with AI stop at the demo. I ship the product,
            then point my own scanners at it. Two critical issues in FocusOS
            came out of that, an API key leak and a paywall bypass. Both fixed
            before anyone else found them.
          </p>
        </div>
      </div>
    </section>
  );
}
