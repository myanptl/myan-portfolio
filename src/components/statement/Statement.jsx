import { RevealText } from '../common/RevealText';
import './statement.css';

export function Statement() {
  return (
    <section className="statement" data-polarity="dark" data-section="approach">
      <div className="shell statement__inner">
        <p className="label statement__kicker">( The other half )</p>

        <h2 className="statement__body">
          <RevealText text="Anyone can ship a demo." stagger={55} />
          <RevealText text="Fewer can break it first." delay={180} stagger={55} />
        </h2>

        <p className="statement__tail">
          FocusOS went live, then I audited it against the OWASP Top 10 for LLM
          applications. Seventeen findings. Two critical: a leaked API key and a
          paywall bypass. Both closed before anyone else went looking.
        </p>
      </div>
    </section>
  );
}
