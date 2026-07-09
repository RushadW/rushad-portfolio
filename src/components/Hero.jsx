import { CONFIG, resumeHref, avatarUrl } from '../config.js';

function PromptLine({ command }) {
  return (
    <p className="prompt-line">
      <span className="prompt-user">
        {CONFIG.handle}@{CONFIG.hostname}
      </span>
      :~<span className="prompt-symbol">$ </span>
      {command}
    </p>
  );
}

export default function Hero() {
  return (
    <section className="section" aria-label="Introduction">
      <PromptLine command={CONFIG.heroCommand} />

      <div className="hero__layout">
        <div className="hero__text">
          <h1 className="hero__name">
            Rushad <mark>Wankadia</mark>
          </h1>

          <p className="hero__tagline">
            {CONFIG.tagline}
            <span className="hero__cursor" aria-hidden="true" />
          </p>
          <p className="hero__subline">{CONFIG.subline}</p>
        </div>

        {CONFIG.github.showAvatar && (
          <img
            className="hero__avatar"
            src={avatarUrl(200)}
            alt={`${CONFIG.name} — GitHub avatar`}
            width={200}
            height={200}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      <div className="hero__actions">
        <a className="btn btn--accent" href={resumeHref()} target="_blank" rel="noreferrer">
          cat resume.pdf
        </a>
        <a className="btn" href={CONFIG.links.github} target="_blank" rel="noreferrer">
          github/RushadW
        </a>
        <a className="btn" href={CONFIG.links.linkedin} target="_blank" rel="noreferrer">
          linkedin
        </a>
      </div>
    </section>
  );
}

export { PromptLine };
