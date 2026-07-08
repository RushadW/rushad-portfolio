import { CONFIG } from '../config.js';
import { useProjects } from '../hooks/useProjects.js';
import { timeAgo } from '../lib/format.js';
import { PromptLine } from './Hero.jsx';
import AsciiSpinner from './AsciiSpinner.jsx';
import ProjectCard from './ProjectCard.jsx';

const SOURCE_LABEL = {
  api: 'live from GitHub',
  cache: 'cached',
  'stale-cache': 'cached (GitHub unreachable)',
  fallback: 'static snapshot',
};

export default function Projects() {
  const { status, projects, source, fetchedAt, error } = useProjects();

  return (
    <section className="section" id="projects" aria-label="Projects">
      <PromptLine command={CONFIG.projectsCommand} />

      <h2 className="section__heading">Latest Builds</h2>
      <p className="section__meta">
        {status === 'ready'
          ? `${projects.length} repos · ${SOURCE_LABEL[source]}${
              fetchedAt ? ` · synced ${timeAgo(new Date(fetchedAt).toISOString())}` : ''
            }`
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

      {status === 'ready' && (
        <div className="projects-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
