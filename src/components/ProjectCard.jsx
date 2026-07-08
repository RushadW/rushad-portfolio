import { timeAgo } from '../lib/format.js';

export default function ProjectCard({ project }) {
  const { name, description, url, homepage, language, tags, stars, pushedAt } =
    project;

  return (
    <article className="project-card">
      <div className="project-card__bar">
        <a href={url} target="_blank" rel="noreferrer">
          {name}/
        </a>
        {language && <span className="project-card__lang">[{language}]</span>}
      </div>

      <div className="project-card__body">
        <p className="project-card__desc">{description}</p>

        {tags.length > 0 && (
          <div className="project-card__tags">
            {tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="project-card__footer">
          <span>pushed {timeAgo(pushedAt)}</span>
          <span>
            {homepage ? (
              <a href={homepage} target="_blank" rel="noreferrer">
                live ↗
              </a>
            ) : (
              `★ ${stars}`
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
