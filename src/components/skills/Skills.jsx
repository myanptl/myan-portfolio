import { Reveal } from '../layout/Reveal';
import { skills } from '../../data/profile';
import './skills.css';

export function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <Reveal as="h2" className="section-title" id="skills-title">
          Technical <span className="accent">Skills</span>
        </Reveal>

        <div className="skills-grid">
          {skills.map((cluster, i) => (
            <Reveal className="skill-group" key={cluster.group} delay={i * 70}>
              <h3 className="skill-group-title mono">
                <span className="skill-prompt">$</span> {cluster.group}
              </h3>
              <ul className="skill-items">
                {cluster.items.map((item) => (
                  <li className="skill-pill mono" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
