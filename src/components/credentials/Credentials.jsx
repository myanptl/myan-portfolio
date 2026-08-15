import { credentials } from '../../data/profile';
import { useSectionInView } from '../../hooks/useSectionInView';
import { useCountUp } from '../../hooks/useCountUp';
import { Scramble } from '../common/Scramble';
import './credentials.css';

const { certifications, programs, volunteering } = credentials;

export function Credentials() {
  const [ref, revealed] = useSectionInView({ threshold: 0.12, once: true });
  const unnamed = certifications.count - certifications.named.length;
  const count = useCountUp(certifications.count, revealed);

  return (
    <section
      ref={ref}
      className={`creds ${revealed ? 'is-revealed' : ''}`}
      data-polarity="light"
      data-section="credentials"
    >
      <div className="shell">
        <header className="creds__head">
          <Scramble as="p" className="label" text="( Credentials )" />
          <Scramble as="p" className="label" text="Anthropic · Y Combinator · Google · AIF" />
        </header>

        <div className="creds__wall">
          <p className="creds__count" aria-label={String(certifications.count)}>
            <span aria-hidden="true">{count}</span>
          </p>
          <div className="creds__body">
            <h2 className="creds__title">Anthropic Academy certifications</h2>
            <p className="creds__note">
              The full track. Seven named here, plus {unnamed} more on the same
              program.
            </p>
          </div>
        </div>

        <ul className="creds__list">
          {certifications.named.map((name, i) => (
            <li key={name} className="creds__item" style={{ '--i': i }}>
              <span className="label creds__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="creds__name">{name}</span>
            </li>
          ))}
        </ul>

        <div className="creds__grid">
          <div className="creds__block">
            <h3 className="label creds__blockTitle">Also certified</h3>
            <ul>
              {certifications.also.map((cert) => (
                <li key={cert.name}>
                  <a href={cert.url} target="_blank" rel="noopener noreferrer">
                    {cert.name}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                  <span className="label">
                    {cert.issuer} · {cert.year}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="creds__block">
            <h3 className="label creds__blockTitle">Programs</h3>
            <ul>
              {programs.map((program) => (
                <li key={program.name}>
                  <span className="creds__plain">{program.name}</span>
                  <span className="label">
                    {program.issuer} · {program.year}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="creds__block creds__block--wide">
            <h3 className="label creds__blockTitle">Volunteering</h3>
            <p className="creds__org">{volunteering.org}</p>
            <p className="label creds__role">
              {volunteering.role} · {volunteering.meta}
            </p>
            <p className="creds__detail">{volunteering.detail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
