import { useSectionInView } from '../../hooks/useSectionInView';
import { useOverflow } from '../../hooks/useOverflow';
import './work.css';

/**
 * A full-bleed work moment.
 *
 * The window is 16:10 and shows the landing page complete and uncropped, which
 * is the whole point: earlier versions cropped to a band and hid the design.
 * Hovering scrolls the captured site through itself, so you can see the rest
 * of the page without leaving.
 *
 * Panning it on scroll instead was tried and dropped: these pages have long
 * whitespace runs between sections, so scroll-linked panning spent most of its
 * travel showing nothing.
 */
export function Takeover({ item, index, eager = false }) {
  const [ref, revealed] = useSectionInView({ threshold: 0.12, once: true });
  const panRef = useOverflow();

  const src = (ext) => `/work/${item.media}-full.${ext}`;

  return (
    <section
      ref={ref}
      className={`takeover ${revealed ? 'is-revealed' : ''}`}
      data-polarity="dark"
      data-section={item.name.toLowerCase()}
    >
      <div className="takeover__window" ref={panRef}>
        <picture className="takeover__pan">
          <source type="image/avif" srcSet={src('avif')} />
          <img
            src={src('webp')}
            alt={item.alt}
            loading={eager ? 'eager' : 'lazy'}
            fetchpriority={eager ? 'high' : 'auto'}
            decoding="async"
          />
        </picture>

        <span className="takeover__ref">{item.meta[1]}</span>
        <span className="takeover__hint">Hover to scroll the page</span>
      </div>

      <div className="takeover__body shell">
        <p className="label takeover__index">
          <span>
            {String(index).padStart(2, '0')} / {item.category}
          </span>
          <span>{item.stat}</span>
        </p>

        <h2 className="takeover__name">{item.name}</h2>
        <p className="takeover__line">{item.line}</p>

        <div className="takeover__row">
          <p className="label takeover__meta">
            {item.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </p>

          <a className="takeover__cta" href={item.href} target="_blank" rel="noopener noreferrer">
            Open it
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
