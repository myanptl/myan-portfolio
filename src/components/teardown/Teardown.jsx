import { PARTS } from '../../data/parts';
import './teardown.css';

/**
 * The pinned teardown.
 *
 * Every text node with an id here is written by the scroll director, not by
 * React. The caption changes seven times across a few hundred pixels of scroll,
 * and routing that through state would re-render the page on every frame to
 * swap two strings.
 *
 * The visible caption is one part at a time, which is unusable without the
 * motion, so the same seven parts are also published as a plain list for screen
 * readers and for anyone with reduced motion on.
 */
export function Teardown() {
  return (
    <section className="teardown" id="teardown" aria-labelledby="teardown-h">
      <div className="teardown__pin">
        <div className="teardown__ui shell">
          <h2 className="sr-only" id="teardown-h">A hard drive, taken apart</h2>

          <p className="label teardown__note">
            A 3.5 inch drive, drawn in the browser from primitives.
            <span className="teardown__noteBreak"> No model files, no textures.</span>
          </p>

          <div className="teardown__readout label" aria-hidden="true">
            <span className="teardown__idx" id="readout-idx">01</span>
            <span>/</span>
            <span>{String(PARTS.length).padStart(2, '0')}</span>
          </div>

          <div className="caption" id="caption" aria-hidden="true">
            <p className="caption__name" id="caption-name">{PARTS[0].name}</p>
            <p className="caption__spec" id="caption-spec">{PARTS[0].spec}</p>
          </div>

          <div className="scrub" aria-hidden="true">
            <span className="scrub__fill" id="scrub" />
          </div>

          <p className="label teardown__hint" id="hint" aria-hidden="true">Hover any part</p>
        </div>
      </div>

      {/* Visually hidden while the scene can animate, and revealed in place of
          the pinned caption when it cannot. Either way it is always in the
          accessibility tree, so the teardown's content never depends on
          watching it happen. */}
      <dl className="teardown__parts shell">
        {PARTS.map((p) => (
          <div key={p.key}>
            <dt>{p.name}</dt>
            <dd>{p.spec}.</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
