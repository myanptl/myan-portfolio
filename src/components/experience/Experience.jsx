import { Reveal } from '../layout/Reveal';
import { ArrowUpRight } from '../layout/Icons';
import { experience } from '../../data/profile';
import './experience.css';

export function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <Reveal as="h2" className="section-title" id="experience-title">
          Experience
        </Reveal>

        <ol className="exp-list">
          {experience.map((job, i) => (
            <Reveal as="li" className="exp-item" key={job.role} delay={i * 80}>
              <div className="exp-rail" aria-hidden="true">
                <span className="exp-node" />
              </div>
              <div className="exp-content">
                <div className="exp-head">
                  <h3 className="exp-role">{job.role}</h3>
                  <span className="exp-org mono">{job.org}</span>
                </div>
                <p className="exp-meta mono">{job.meta}</p>
                {job.link && (
                  <a
                    className="exp-link mono"
                    href={job.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {job.link.label} <ArrowUpRight />
                  </a>
                )}
                {job.bullets.length > 0 && (
                  <ul className="exp-bullets">
                    {job.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
