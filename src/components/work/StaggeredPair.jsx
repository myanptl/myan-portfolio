import { useSectionInView } from '../../hooks/useSectionInView';
import { WorkMedia } from './WorkMedia';
import './work.css';

function PairItem({ item, index }) {
  const [ref, revealed] = useSectionInView({ threshold: 0.2, once: true });

  const className = [
    'pair__item',
    `pair__item--${item.scale || 'lg'}`,
    item.offset ? 'pair__item--offset' : '',
    revealed ? 'is-revealed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article ref={ref} className={className} style={{ '--dir': index % 2 === 0 ? 1 : -1 }}>
      <a className="pair__link" href={item.href} target="_blank" rel="noopener noreferrer">
        {item.textOnly ? (
          <div className="pair__plate">
            <p className="pair__note">{item.note}</p>
          </div>
        ) : (
          <div className="pair__media">
            <WorkMedia media={item.media} alt={item.alt} />
          </div>
        )}

        <div className="pair__meta">
          <p className="label">{item.name}</p>
          <p className="pair__line">{item.line}</p>
        </div>
      </a>
    </article>
  );
}

export function StaggeredPair({ pair }) {
  return (
    <section className="pair shell" data-polarity="dark" data-section="work">
      {pair.items.map((item, i) => (
        <PairItem key={item.name} item={item} index={i} />
      ))}
    </section>
  );
}
