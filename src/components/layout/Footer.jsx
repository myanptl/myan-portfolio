import { iconMap } from './Icons';
import { profile } from '../../data/profile';
import './footer.css';

export function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="container footer-inner">
        <span className="footer-eof tok-comment" aria-hidden="true">
          {'// EOF — thanks for reading the source'}
        </span>

        <nav className="footer-links" aria-label="Social links">
          {profile.links.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.ariaLabel}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link mono"
              >
                {Icon && <Icon />}
                {link.label}
              </a>
            );
          })}
        </nav>

        <p className="footer-meta mono">
          Built by {profile.fullName} · React + Vite · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
