import { experience, projects, skills, credentials } from '../../data/profile';
import { useGithubStats, formatPushed } from '../../hooks/useGithubStats';
import './record.css';

function Row({ project, stats }) {
  const repoStats = project.repo ? stats[project.repo] : null;
  const pushed = repoStats ? formatPushed(repoStats.pushedAt) : null;

  return (
    <a
      className="record__row"
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="record__name">{project.name}</span>
      <span className="record__tagline">{project.tagline}</span>
      <span className="label record__stat">
        {repoStats?.language || project.tags?.[0]}
        {pushed ? ` · ${pushed}` : ''}
      </span>
      <span className="record__arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

export function Record() {
  const stats = useGithubStats();

  return (
    <section className="record" data-polarity="light" data-section="the record">
      <div className="shell">
        <header className="record__head">
          <h2 className="record__title">The Record</h2>
          <p className="label">( {projects.length} shipped )</p>
        </header>

        <div className="record__list">
          {projects.map((project) => (
            <Row key={project.name} project={project} stats={stats} />
          ))}
        </div>

        <div className="record__grid">
          <div className="record__block">
            <h3 className="label record__blockTitle">Experience</h3>
            <ul className="record__stack">
              {experience.map((job) => (
                <li key={`${job.org}-${job.role}`}>
                  <p className="record__role">{job.role}</p>
                  <p className="record__org">{job.org}</p>
                  <p className="label">{job.meta}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="record__block">
            <h3 className="label record__blockTitle">Stack</h3>
            <ul className="record__stack">
              {skills.map((group) => (
                <li key={group.group}>
                  <p className="record__role">{group.group}</p>
                  <p className="record__org record__org--soft">
                    {group.items.join(', ')}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="record__block">
            <h3 className="label record__blockTitle">Credentials</h3>
            <p className="record__big">18</p>
            <p className="record__org">
              {credentials.certifications.headline.replace('18 ', '')}
            </p>
            <ul className="record__also">
              {credentials.certifications.also.map((cert) => (
                <li key={cert.name}>
                  <a href={cert.url} target="_blank" rel="noopener noreferrer">
                    {cert.name}
                  </a>
                  <span className="label">
                    {' '}
                    {cert.issuer} · {cert.year}
                  </span>
                </li>
              ))}
            </ul>
            <p className="record__org record__org--soft record__vol">
              {credentials.volunteering.role}, {credentials.volunteering.org}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
