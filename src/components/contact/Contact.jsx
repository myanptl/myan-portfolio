import { profile } from '../../data/profile';
import { useMagnetic } from '../../hooks/useMagnetic';
import { RevealText } from '../common/RevealText';
import { Scramble } from '../common/Scramble';
import './contact.css';

function MagneticLink({ link }) {
  const ref = useMagnetic({ strength: 0.28, radius: 70 });

  return (
    <a
      ref={ref}
      className="contact__link"
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.ariaLabel}
    >
      {link.label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

export function Contact() {
  return (
    <section className="contact" data-polarity="dark" data-section="contact">
      <div className="shell">
        <Scramble as="p" className="label contact__kicker" text="( Say hello )" />

        <h2 className="contact__title">
          <RevealText text="Open to internships" stagger={55} />
          <RevealText text="and hard problems." delay={150} stagger={55} />
        </h2>

        <ul className="contact__links">
          {profile.links.map((link) => (
            <li key={link.label}>
              <MagneticLink link={link} />
            </li>
          ))}
        </ul>

        <p className="label contact__foot">
          <span>{profile.fullName}</span>
          <span>Class of 2028</span>
          <span>© 2026</span>
        </p>
      </div>
    </section>
  );
}
