import { Reveal } from '../layout/Reveal';
import { SectionDecl, SectionClose } from '../layout/SectionDecl';
import { skills } from '../../data/profile';
import './skills.css';

export function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionDecl
          name="skills"
          lineno={138}
          title="What I work with"
          titleId="skills-title"
        />

        <div className="skills-sheet sheet">
          <dl className="skills-list">
            {skills.map((cluster, i) => (
              <Reveal as="div" className="skill-row" key={cluster.group} delay={i * 60}>
                <dt className="skill-key mono">
                  {cluster.group.toLowerCase().replace(/[^a-z]+/g, '_')}
                  <span aria-hidden="true">:</span>
                </dt>
                <dd className="skill-values">
                  <span className="skill-bracket mono" aria-hidden="true">
                    [
                  </span>
                  <ul className="skill-items">
                    {cluster.items.map((item) => (
                      <li className="skill-pill" key={item}>
                        <span aria-hidden="true">&quot;</span>
                        {item}
                        <span aria-hidden="true">&quot;</span>
                      </li>
                    ))}
                  </ul>
                  <span className="skill-bracket mono" aria-hidden="true">
                    ]
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <SectionClose />
      </div>
    </section>
  );
}
