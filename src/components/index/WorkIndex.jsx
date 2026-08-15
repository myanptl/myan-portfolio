import { useCallback, useRef, useState } from 'react';
import { workIndex } from '../../data/work';
import { useSectionInView } from '../../hooks/useSectionInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Scramble } from '../common/Scramble';
import './index.css';

/**
 * The work, as a typographic index rather than a grid of screenshots.
 *
 * Hovering a row floats that project's capture beside the pointer, shown whole
 * and untouched. Cropping captures into fixed cards and covering them with
 * treatments is what made earlier versions look bad; here the image is never
 * cropped, never filtered, and only ever appears at full frame.
 */
export function WorkIndex() {
  const [ref, revealed] = useSectionInView({ threshold: 0.08, once: true });
  const [active, setActive] = useState(null);
  const reducedMotion = useReducedMotion();
  const previewRef = useRef(null);
  const frame = useRef(0);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const animate = useCallback(() => {
    const p = pos.current;
    const prevX = p.x;
    p.x += (p.tx - p.x) * 0.12;
    p.y += (p.ty - p.y) * 0.12;

    if (previewRef.current) {
      // Leans into the direction of travel and lags slightly behind the
      // pointer, which is what makes it read as a physical object being
      // dragged rather than a tooltip pinned to the cursor.
      const lean = Math.max(-14, Math.min(14, (p.x - prevX) * 1.6));
      previewRef.current.style.transform =
        `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${lean.toFixed(2)}deg)`;
    }

    if (Math.abs(p.tx - p.x) > 0.4 || Math.abs(p.ty - p.y) > 0.4) {
      frame.current = requestAnimationFrame(animate);
    } else {
      frame.current = 0;
    }
  }, []);

  const onMove = useCallback(
    (event) => {
      if (reducedMotion) return;
      const p = pos.current;
      p.tx = event.clientX;
      p.ty = event.clientY;
      if (!frame.current) frame.current = requestAnimationFrame(animate);
    },
    [animate, reducedMotion],
  );

  const onEnter = useCallback((item, event) => {
    // Seed the position so the preview does not fly in from the last row.
    const p = pos.current;
    p.x = event.clientX;
    p.y = event.clientY;
    p.tx = event.clientX;
    p.ty = event.clientY;
    setActive(item);
  }, []);

  return (
    <section
      ref={ref}
      className={`index ${revealed ? 'is-revealed' : ''}`}
      data-polarity="light"
      data-section="index"
      onPointerMove={onMove}
      onPointerLeave={() => setActive(null)}
    >
      <div className="shell">
        <header className="index__head">
          <Scramble as="p" className="label" text="( Selected work )" />
          <p className="label">{workIndex.length} shipped</p>
        </header>

        <ul className="index__list">
          {workIndex.map((item, i) => (
            <li key={item.name} className="index__row" style={{ '--i': i }}>
              <a
                className="index__link"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onPointerEnter={(event) => onEnter(item, event)}
                onFocus={() => setActive(item)}
                onBlur={() => setActive(null)}
              >
                <span className="label index__num">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Two stacked copies. On hover the pair slides so the second
                    takes the first's place, which reads as the row answering
                    rather than just highlighting. */}
                <span className="index__name" aria-label={item.name}>
                  <span className="index__nameRoll" aria-hidden="true">
                    <span>{item.name}</span>
                    <span>{item.name}</span>
                  </span>
                </span>
                <span className="index__role">{item.role}</span>
                <span className="label index__year">{item.year}</span>
                <span className="index__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Floats with the pointer. Outside the list so row hover never clips it. */}
      {!reducedMotion && (
        <div
          ref={previewRef}
          className={`preview ${active ? 'is-active' : ''}`}
          aria-hidden="true"
        >
          {active?.media && (
            <img
              src={`/work/${active.media}-800.webp`}
              alt=""
              width="800"
              height="500"
              decoding="async"
            />
          )}
        </div>
      )}
    </section>
  );
}
