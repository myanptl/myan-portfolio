import { useSectionInView } from '../../hooks/useSectionInView';
import { useImageDither } from '../../hooks/useImageDither';
import { WorkMedia } from './WorkMedia';
import './work.css';

/**
 * One work item. Every card is the same size and the same shape, on purpose:
 * the earlier staggered version read as arbitrary rather than composed.
 * Difference comes from the captures themselves and from the hover behaviour.
 */
function WorkCard({ item, index }) {
  const [ref, revealed] = useSectionInView({ threshold: 0.15, once: true });
  const ditherRef = useImageDither(item.media ? `/work/${item.media}-800.webp` : null);

  return (
    <article
      ref={ref}
      className={`card ${revealed ? 'is-revealed' : ''}`}
      style={{ '--i': index % 2 }}
    >
      <a className="card__link" href={item.href} target="_blank" rel="noopener noreferrer">
        <div className="card__frame">
          {item.textOnly ? (
            <div className="card__plate">
              <p className="card__note">{item.note}</p>
            </div>
          ) : (
            <div className="card__media">
              <WorkMedia media={item.media} alt={item.alt} />
              {/* One-bit version sits on top and lifts on hover. */}
              <canvas ref={ditherRef} className="card__dither" aria-hidden="true" />
            </div>
          )}

          <span className="card__tag">{item.category}</span>
        </div>

        <div className="card__foot">
          <span className="card__name">{item.name}</span>
          <span className="card__year">{item.year}</span>
        </div>

        <p className="card__line">{item.line}</p>
      </a>
    </article>
  );
}

export function WorkGrid({ items, id }) {
  return (
    <section className="work shell" data-polarity="dark" data-section="work" id={id}>
      {items.map((item, i) => (
        <WorkCard key={item.name} item={item} index={i} />
      ))}
    </section>
  );
}
