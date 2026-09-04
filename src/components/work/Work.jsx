import { workIndex } from '../../data/work';
import './work.css';

/**
 * The work, as a numbered index.
 *
 * Deliberately the same visual language as the teardown readout: mono,
 * two-digit numerals, hairline rules. The drive comes apart into seven numbered
 * parts and the work is eleven numbered entries, so the object reads as
 * belonging to the page rather than as a demo bolted onto the front of it.
 *
 * No screenshots. Eleven cropped captures meant eleven competing colour worlds
 * on a page that otherwise has none, and a shrunk-down screenshot tells you
 * less than four words do.
 */
export function Work() {
  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <div className="shell">
        <header className="work__head">
          <h2 className="label" id="work-h">Work</h2>
          <p className="label work__count">{workIndex.length} shipped</p>
        </header>

        <ul className="work__list">
          {workIndex.map((item, i) => (
            <li key={item.name}>
              <a
                className="work__row"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="work__idx label" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="work__name">{item.name}</span>
                <span className="work__role">{item.role}</span>
                <span className="work__at label">{item.at}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
