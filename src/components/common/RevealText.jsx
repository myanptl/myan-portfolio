import { useSectionInView } from '../../hooks/useSectionInView';
import './reveal.css';

/**
 * Splits a line into words and lifts each one from behind its own mask.
 *
 * Every mask carries vertical padding. Tight line-heights on large display type
 * put ascenders and descenders outside the line box, and a mask sized to the
 * line box alone shears the tops and tails off the letters.
 */
export function RevealText({ as: Tag = 'span', text, className = '', delay = 0, stagger = 60 }) {
  const [ref, revealed] = useSectionInView({ threshold: 0.2, once: true });
  const words = String(text).split(' ');

  return (
    <Tag ref={ref} className={`reveal ${revealed ? 'is-revealed' : ''} ${className}`}>
      {words.map((word, i) => (
        <span className="reveal__mask" key={`${word}-${i}`}>
          <span
            className="reveal__word"
            style={{ transitionDelay: `${delay + i * stagger}ms` }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}
