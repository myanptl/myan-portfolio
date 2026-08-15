import { experience, skills } from '../../data/profile';
import { useSectionInView } from '../../hooks/useSectionInView';
import { Scramble } from '../common/Scramble';
import './experience.css';

export function Experience() {
  const [ref, revealed] = useSectionInView({ threshold: 0.12, once: true });

  return (
    <section
      ref={ref}
      className={`exp ${revealed ? 'is-revealed' : ''}`}
      data-polarity="dark"
      data-section="experience"
    >
      <div className="shell exp__inner">
        <div className="exp__col">
          <Scramble as="h2" className="label exp__title" text="( Roles )" />
          <ul className="exp__list">
            {experience.map((job, i) => (
              <li key={`${job.org}-${job.role}`} className="exp__item" style={{ '--i': i }}>
                <p className="exp__org">{job.org}</p>
                <p className="exp__role">{job.role}</p>
                <p className="label">{job.meta}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="exp__col exp__col--narrow">
          <Scramble as="h2" className="label exp__title" text="( Stack )" />
          <ul className="exp__stack">
            {skills.map((group, i) => (
              <li key={group.group} className="exp__item" style={{ '--i': i }}>
                <p className="label exp__group">{group.group}</p>
                <p className="exp__items">{group.items.join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
