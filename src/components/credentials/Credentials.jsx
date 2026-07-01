import { Reveal } from '../layout/Reveal';
import { credentials } from '../../data/profile';
import './credentials.css';

export function Credentials() {
  const { certifications, volunteering } = credentials;

  return (
    <section className="section" id="more" aria-labelledby="more-title">
      <div className="container">
        <Reveal as="h2" className="section-title" id="more-title">
          Certifications <span className="accent">&amp;</span> Impact
        </Reveal>

        <div className="cred-grid">
          <Reveal className="cred-card cred-certs">
            <span className="cred-kicker mono">// certifications</span>
            <h3 className="cred-title">{certifications.headline}</h3>
            <p className="cred-detail">{certifications.detail}</p>
            <div className="cred-stat">
              <span className="cred-stat-num">18</span>
              <span className="cred-stat-label mono">Anthropic Academy certs</span>
            </div>
          </Reveal>

          <Reveal className="cred-card cred-volunteer" delay={90}>
            <span className="cred-kicker mono">// volunteering</span>
            <h3 className="cred-title">{volunteering.org}</h3>
            <p className="cred-role mono">
              {volunteering.role} · {volunteering.meta}
            </p>
            <p className="cred-detail">{volunteering.detail}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
