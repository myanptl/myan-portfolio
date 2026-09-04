import { profile } from '../../data/profile';
import './hero.css';

/**
 * The landing. Three lines of text and an object.
 *
 * The previous hero carried an animated chrome gradient on the headline, a
 * character-by-character kinetic reveal, three scrambling labels and a WebGL
 * dither field behind all of it. It was replaced rather than tuned: the object
 * is the thing worth looking at, and everything else was competing with it.
 */
export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-name">
      <div className="hero__inner shell" id="hero-inner">
        <p className="label">{profile.where}</p>

        <div className="hero__block">
          <h1 className="hero__name" id="hero-name">{profile.name}</h1>
          <p className="hero__lead">{profile.lead}</p>
        </div>

        <p className="label hero__cue">Scroll to open it</p>
      </div>
    </section>
  );
}
