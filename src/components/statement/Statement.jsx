import { useSectionInView } from '../../hooks/useSectionInView';
import './statement.css';

const LINES = [
  'I ship real products,',
  'then audit them like',
  'an attacker would.',
];

export function Statement() {
  const [ref, revealed] = useSectionInView({ threshold: 0.3, once: true });

  return (
    <section
      ref={ref}
      className={`statement ${revealed ? 'is-revealed' : ''}`}
      data-polarity="dark"
      data-section="about"
    >
      <div className="shell">
        <p className="label statement__kicker">( Who )</p>

        <h2 className="statement__body">
          {LINES.map((line, i) => (
            <span key={line} className="statement__line" style={{ '--i': i }}>
              {line}
            </span>
          ))}
        </h2>

        <p className="statement__tail">
          Rising junior at Westford Academy. Aiming at generative AI product
          management, with security as the other half of the job. Eleven things
          live, every one of them built end to end.
        </p>
      </div>
    </section>
  );
}
