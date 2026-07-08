import { CONFIG } from '../config.js';

export default function TitleBar() {
  return (
    <header className="titlebar">
      <div className="titlebar__dots" aria-hidden="true">
        <span className="titlebar__dot" />
        <span className="titlebar__dot" />
        <span className="titlebar__dot titlebar__dot--accent" />
      </div>
      <span className="titlebar__title">
        {CONFIG.handle}@{CONFIG.hostname}: ~
      </span>
      <nav className="titlebar__nav" aria-label="Main">
        <a href="#projects">projects</a>
        <a href={CONFIG.resumePath} target="_blank" rel="noreferrer">
          resume
        </a>
        <a href={`mailto:${CONFIG.email}`}>contact</a>
      </nav>
    </header>
  );
}
