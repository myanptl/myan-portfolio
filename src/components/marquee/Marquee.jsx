import { marqueeWords } from '../../data/work';
import './marquee.css';

/**
 * The shipping record as a moving strip. Its speed and skew are driven by
 * --scroll-velocity, so it reacts to how hard you are scrolling rather than
 * running at one constant rate.
 */
export function Marquee() {
  const strip = [...marqueeWords, ...marqueeWords];

  return (
    <section className="marquee" data-polarity="dark" data-tone="slate" data-section="shipped">
      <div className="marquee__track" aria-hidden="true">
        {strip.map((word, i) => (
          <span key={`${word}-${i}`} className="marquee__word">
            {word}
            <i className="marquee__dot" />
          </span>
        ))}
      </div>
      <p className="sr-only">Shipped: {marqueeWords.join(', ')}.</p>
    </section>
  );
}
