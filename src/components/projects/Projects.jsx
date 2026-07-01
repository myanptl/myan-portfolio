import { Reveal } from '../layout/Reveal';
import { ArrowUpRight } from '../layout/Icons';
import { projects } from '../../data/profile';
import './projects.css';

export function Projects() {
  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <Reveal as="h2" className="section-title" id="projects-title">
          Projects
        </Reveal>

        <div className="proj-list">
          {projects.map((project, i) => (
            <Reveal key={project.name} delay={i * 70}>
              <a
                className="proj-card"
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="proj-card-main">
                  <div className="proj-card-head">
                    <h3 className="proj-name">
                      {project.name}
                      <ArrowUpRight className="proj-arrow" />
                    </h3>
                    <span className="proj-badge mono">{project.badge}</span>
                  </div>
                  <p className="proj-tagline">{project.tagline}</p>
                  <p className="proj-desc">{project.description}</p>
                  <ul className="proj-tags" aria-label="Tech stack">
                    {project.tags.map((tag) => (
                      <li className="proj-tag mono" key={tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
