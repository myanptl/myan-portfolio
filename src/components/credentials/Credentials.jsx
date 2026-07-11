import { Reveal } from '../layout/Reveal';
import { SectionDecl, SectionClose } from '../layout/SectionDecl';
import { credentials } from '../../data/profile';
import './credentials.css';

export function Credentials() {
  const { certifications, volunteering } = credentials;

  return (
    <section className="section" id="more" aria-labelledby="more-title">
      <div className="container">
        <SectionDecl
          name="credentials"
          lineno={175}
          title="Proof of work"
          titleId="more-title"
        />

        <div className="cred-grid">
          <Reveal className="cred-card cred-certs sheet">
            <span className="cred-kicker tok-comment">// certifications</span>
            <div className="cred-stat">
              <span className="cred-stat-num">18</span>
              <span className="cred-stat-label mono">
                Anthropic Academy certifications
              </span>
            </div>
            <p className="cred-detail">{certifications.detail}</p>
          </Reveal>

          <Reveal className="cred-card cred-volunteer sheet" delay={90}>
            <span className="cred-kicker tok-comment">// volunteering</span>
            <h3 className="cred-title">{volunteering.org}</h3>
            <p className="cred-role mono">
              {volunteering.role} · {volunteering.meta}
            </p>
            <p className="cred-detail">{volunteering.detail}</p>
          </Reveal>
        </div>

        <SectionClose />
      </div>
    </section>
  );
}
