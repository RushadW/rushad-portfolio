import { CONFIG } from '../config.js';

const CORE_SKILLS = [
  'C++', 'C#', 'Python', 'React', 'FastAPI', '.NET',
  'AWS', 'Docker', 'PostgreSQL', 'PyTorch',
];

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

      <h1 className="hero__name">
        Rushad <mark>Wankadia</mark>
      </h1>

      <p className="hero__tagline">
        {CONFIG.tagline}
        <span className="hero__cursor" aria-hidden="true" />
      </p>
      <p className="hero__subline">{CONFIG.subline}</p>

      <div className="hero__actions">
        <a
          className="btn btn--accent"
          href={CONFIG.resumePath}
          target="_blank"
          rel="noreferrer"
        >
          cat resume.pdf
        </a>
        <a className="btn" href={CONFIG.links.github} target="_blank" rel="noreferrer">
          github/RushadW
        </a>
        <a className="btn" href={CONFIG.links.linkedin} target="_blank" rel="noreferrer">
          linkedin
        </a>
      </div>

      <div style={{ marginTop: '2rem' }} className="skills" aria-label="Core skills">
        {CORE_SKILLS.map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}

export { PromptLine };
