import { iconMap } from './Icons';
import { profile } from '../../data/profile';
import './footer.css';

export function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="container footer-inner">
        <span className="footer-prompt mono" aria-hidden="true">
          <span className="term-prompt">myan@web:~$</span> exit
        </span>

        <nav className="footer-links" aria-label="Social links">
          {profile.links.map((link) => {
            const Icon = iconMap[link.icon];
            const external = link.href.startsWith('http');
            return (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.ariaLabel}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
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
