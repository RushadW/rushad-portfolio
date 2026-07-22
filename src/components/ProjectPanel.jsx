import { useState, useEffect } from 'react';
import { CONFIG } from '../config.js';
import { timeAgo } from '../lib/format.js';
import MediaCarousel from './MediaCarousel.jsx';

let cachePromise = null;

function loadReadmeCache() {
  if (!cachePromise) {
    cachePromise = fetch(CONFIG.ai.cachePath)
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}));
  }
  return cachePromise;
}

function getFallbackOgImage(project) {
  const custom = CONFIG.github.media[project.name];
  if (custom?.length) return custom[0];
  return `https://opengraph.githubassets.com/portfolio/${CONFIG.github.username}/${project.name}`;
}

export default function ProjectPanel({ project }) {
  const { name, description, url, homepage, language, tags, stars, pushedAt } = project;
  const [summaryData, setSummaryData] = useState(null);
  const fallbackOgImage = getFallbackOgImage(project);

  useEffect(() => {
    let isMounted = true;
    loadReadmeCache().then((cache) => {
      if (isMounted && cache[name]) {
        setSummaryData(cache[name]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [name]);

  const activeDescription = summaryData?.summary || description;
  const mediaList = summaryData?.media?.length > 0
    ? summaryData.media
    : [{ url: fallbackOgImage, alt: `${name} preview` }];

  const videoLinks = summaryData?.videoLinks || [];
  const linksList = summaryData?.links || [];

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

      {/* AI / Preserved README Summary */}
      <div className="panel__desc-box">
        {summaryData?.summary ? (
          <div className="panel__ai-summary">
            <span className="ai-badge">&gt; AI_SUMMARY (README.md)</span>
            <div className="summary-text">
              {activeDescription.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        ) : (
          <p className="panel__desc">{description}</p>
        )}
      </div>

      {tags.length > 0 && (
        <div className="panel__tags">
          {tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Interactive Neobrutalist Media Carousel */}
      <MediaCarousel
        media={mediaList}
        videoLinks={videoLinks}
        links={linksList}
        fallbackImage={fallbackOgImage}
      />
    </article>
  );
}
