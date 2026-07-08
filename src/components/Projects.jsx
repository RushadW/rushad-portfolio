import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config.js';
import { useProjects } from '../hooks/useProjects.js';
import { timeAgo } from '../lib/format.js';
import { PromptLine } from './Hero.jsx';
import AsciiSpinner from './AsciiSpinner.jsx';
import ProjectPanel from './ProjectPanel.jsx';

const SOURCE_LABEL = {
  api: 'live from GitHub',
  cache: 'cached',
  'stale-cache': 'cached (GitHub unreachable)',
  fallback: 'static snapshot',
};

export default function Projects() {
  const { status, projects, source, fetchedAt, error } = useProjects();
  const [active, setActive] = useState(0);

  const sectionRef = useRef(null);
  const tabRefs = useRef([]);
  const [inView, setInView] = useState(false);

  const count = projects.length;

  const move = (delta) => {
    if (!count) return;
    setActive((i) => (i + delta + count) % count);
  };

  // Track whether the section is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Left/Right arrows switch tabs whenever the section is visible
  // (vertical arrows are untouched, so page scrolling still works).
  useEffect(() => {
    if (!inView || status !== 'ready') return;
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, status, count]);

  // Keep DOM focus in sync when arrowing while the tablist is focused.
  const onTabKeyDown = (e) => {
    if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
      tabRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(count - 1);
      tabRefs.current[count - 1]?.focus();
    }
  };

  return (
    <section className="section" id="projects" aria-label="Projects" ref={sectionRef}>
      <PromptLine command={CONFIG.projectsCommand} />

      <h2 className="section__heading">Latest Builds</h2>
      <p className="section__meta">
        {status === 'ready'
          ? `${count} repos · ${SOURCE_LABEL[source]}${
              fetchedAt ? ` · synced ${timeAgo(new Date(fetchedAt).toISOString())}` : ''
            } · use ← → to switch tabs`
          : 'pulling repositories, newest push first'}
      </p>

      {status === 'loading' && <AsciiSpinner />}

      {status === 'error' && (
        <div className="error-box" role="alert">
          <strong>ERR:</strong> could not reach the GitHub API and no local
          snapshot was found ({error}).{' '}
          <a href={CONFIG.links.github} target="_blank" rel="noreferrer">
            Browse repos directly on GitHub →
          </a>
        </div>
      )}

      {status === 'ready' && count > 0 && (
        <div className="tabs-shell">
          <div
            className="tabs"
            role="tablist"
            aria-label="Projects"
            onKeyDown={onTabKeyDown}
          >
            {projects.map((p, i) => (
              <button
                key={p.id}
                ref={(el) => (tabRefs.current[i] = el)}
                role="tab"
                id={`tab-${p.id}`}
                aria-selected={i === active}
                aria-controls={`panel-${p.id}`}
                tabIndex={i === active ? 0 : -1}
                className="tab"
                onClick={() => setActive(i)}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`panel-${projects[active].id}`}
            aria-labelledby={`tab-${projects[active].id}`}
            className="tab-panel"
          >
            <ProjectPanel project={projects[active]} />
          </div>
        </div>
      )}
    </section>
  );
}
