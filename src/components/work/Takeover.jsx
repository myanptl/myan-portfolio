import { useSectionInView } from '../../hooks/useSectionInView';
import { WorkMedia } from './WorkMedia';
import './work.css';

/**
 * A full-bleed work moment. The media is the whole screen; the type sits over
 * it on a hairline grid. These are the only sections that carry large color.
 */
export function Takeover({ item, index, eager = false }) {
  const [ref, revealed] = useSectionInView({ threshold: 0.15, once: true });

  return (
    <section
      ref={ref}
      className={`takeover ${revealed ? 'is-revealed' : ''}`}
      data-polarity="dark"
      data-section={item.name.toLowerCase()}
    >
      <div className="takeover__media" style={{ '--focus': item.focus || 'center top' }}>
        <WorkMedia media={item.media} alt={item.alt} eager={eager} />
      </div>

      <div className="takeover__body shell">
        <p className="label takeover__index">
          <span>{String(index).padStart(2, '0')}</span>
          <span>{item.stat}</span>
        </p>

        <h2 className="takeover__name">{item.name}</h2>
        <p className="takeover__line">{item.line}</p>

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
    </section>
  );
}
