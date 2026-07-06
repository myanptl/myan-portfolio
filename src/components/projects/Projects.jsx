import { Reveal } from '../layout/Reveal';
import { SectionDecl, SectionClose } from '../layout/SectionDecl';
import { ArrowUpRight } from '../layout/Icons';
import { projects } from '../../data/profile';
import { useGithubStats, formatPushed } from '../../hooks/useGithubStats';
import './projects.css';

function RepoStats({ stat }) {
  if (!stat) return null;
  const pushed = formatPushed(stat.pushedAt);
  return (
    <ul className="proj-stats mono" aria-label="Live GitHub stats">
      {stat.language && <li>{stat.language}</li>}
      {stat.stars > 0 && <li>★ {stat.stars}</li>}
      {stat.forks > 0 && <li>⑂ {stat.forks}</li>}
      {pushed && <li>updated {pushed}</li>}
    </ul>
  );
}

export function Projects() {
  const stats = useGithubStats();

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionDecl
          name="projects"
          lineno={56}
          title="Things I've shipped"
          titleId="projects-title"
        />

        <div className="proj-grid">
          {projects.map((project, i) => (
            <Reveal
              key={project.name}
              delay={i * 70}
              className={i === 0 ? 'proj-cell proj-cell-featured' : 'proj-cell'}
            >
              <a
                className={
                  i === 0 ? 'proj-card proj-card-featured sheet' : 'proj-card sheet'
                }
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
                  <RepoStats stat={project.repo ? stats[project.repo] : null} />
                  <ul className="proj-tags" aria-label="Tech stack">
                    {project.tags.map((tag) => (
                      <li className="proj-tag" key={tag}>
                        <span aria-hidden="true">&quot;</span>
                        {tag}
                        <span aria-hidden="true">&quot;</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <SectionClose />
      </div>
    </section>
  );
}
