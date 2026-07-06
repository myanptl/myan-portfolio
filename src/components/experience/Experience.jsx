import { Reveal } from '../layout/Reveal';
import { SectionDecl, SectionClose } from '../layout/SectionDecl';
import { ArrowUpRight } from '../layout/Icons';
import { experience } from '../../data/profile';
import './experience.css';

export function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionDecl
          name="experience"
          lineno={28}
          title="Where I've worked"
          titleId="experience-title"
        />

        <ol className="exp-list">
          {experience.map((job, i) => (
            <Reveal as="li" className="exp-item sheet" key={job.role} delay={i * 80}>
              <div className="exp-head">
                <h3 className="exp-role">{job.role}</h3>
                <span className="exp-org mono">{job.org}</span>
              </div>
              <p className="exp-meta tok-comment">{job.meta}</p>
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
            </Reveal>
          ))}
        </ol>

        <SectionClose />
      </div>
    </section>
  );
}
