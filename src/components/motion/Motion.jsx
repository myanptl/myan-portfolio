import { motionReel } from '../../data/motion';
import './motion.css';

/** Motion work. Same header and hairline language as the work index. */
export function Motion() {
  return (
    <section className="motion" id="motion" aria-labelledby="motion-h">
      <div className="shell">
        <header className="work__head">
          <h2 className="label" id="motion-h">Motion</h2>
          <p className="label work__count">Made in code</p>
        </header>

        <ul className="motion__list">
          {motionReel.map((item) => (
            <li key={item.slug} className="motion__item">
              <video
                className="motion__video"
                src={`/motion/${item.slug}.mp4`}
                poster={`/motion/${item.slug}.jpg`}
                width="1280"
                height="720"
                controls
                playsInline
                preload="none"
              />
              <p className="motion__name">{item.name}</p>
              <p className="motion__role">{item.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
