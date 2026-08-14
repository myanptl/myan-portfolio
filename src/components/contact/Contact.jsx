import { profile } from '../../data/profile';
import './contact.css';

export function Contact() {
  return (
    <section className="contact" data-polarity="dark" data-section="contact">
      <div className="shell">
        <p className="label contact__kicker">( Next )</p>

        <h2 className="contact__title">
          Building something?
          <br />
          Tell me about it.
        </h2>

        <ul className="contact__links">
          {profile.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
              >
                {link.label}
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="label contact__foot">
          <span>{profile.fullName}</span>
          <span>Westford, MA</span>
          <span>© 2026</span>
        </p>
      </div>
    </section>
  );
}
