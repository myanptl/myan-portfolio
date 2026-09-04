import { profile } from '../../data/profile';
import './contact.css';

/** The whole "about" section, which is one sentence and two links. */
export function Contact() {
  return (
    <footer className="contact" id="contact">
      <div className="shell contact__inner">
        <p className="contact__now">{profile.now}</p>

        <ul className="contact__links">
          {profile.links.map((link) => (
            <li key={link.label}>
              <a className="contact__link" href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="label contact__foot">
          <span>{profile.name}, 2026</span>
          <span>Engine built with three.js</span>
        </p>
      </div>
    </footer>
  );
}
