import { useState } from 'react';
import { CONFIG } from '../config.js';
import { timeAgo } from '../lib/format.js';

/**
 * Images shown for a repo:
 *   1. CONFIG.github.media['repo-name'] if you added screenshots
 *      (drop files into public/media/ and list their paths).
 *   2. Otherwise, the repo's auto-generated GitHub social-preview
 *      card — customizable per repo on GitHub under
 *      Settings → Social preview.
 */
function mediaFor(project) {
  const custom = CONFIG.github.media[project.name];
  if (custom?.length) return custom;
  return [
    `https://opengraph.githubassets.com/portfolio/${CONFIG.github.username}/${project.name}`,
  ];
}

export default function ProjectPanel({ project }) {
  const { name, description, url, homepage, language, tags, stars, pushedAt } =
    project;
  const images = mediaFor(project);
  const [broken, setBroken] = useState({});

  return (
    <article className="panel">
      <div className="panel__meta">
        <span>
          {language && <span className="panel__lang">[{language}]</span>} pushed{' '}
          {timeAgo(pushedAt)} · ★ {stars}
        </span>
        <span className="panel__links">
          <a href={url} target="_blank" rel="noreferrer">
            source ↗
          </a>
          {homepage && (
            <a href={homepage} target="_blank" rel="noreferrer">
              live ↗
            </a>
          )}
        </span>
      </div>

      <p className="panel__desc">{description}</p>

      {tags.length > 0 && (
        <div className="panel__tags">
          {tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="panel__media">
        {images.map(
          (src) =>
            !broken[src] && (
              <img
                key={src}
                src={src}
                alt={`${name} screenshot`}
                loading="lazy"
                onError={() => setBroken((b) => ({ ...b, [src]: true }))}
              />
            )
        )}
      </div>
    </article>
  );
}
