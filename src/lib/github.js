/**
 * GitHub project feed — zero-backend design.
 *
 * Strategy (cheapest thing that works):
 *   1. Serve from localStorage if the cached payload is younger
 *      than CONFIG.github.refreshIntervalMs.  → 0 network calls.
 *   2. Otherwise hit the public GitHub REST API (1 request,
 *      unauthenticated: 60 req/hr per visitor IP — plenty, since
 *      each visitor refreshes at most once per interval).
 *   3. If the API fails and a stale cache exists, serve stale.
 *   4. If there is no cache at all, fall back to the static
 *      /data/profile.json snapshot bundled with the site.
 *
 * Changing the refresh frequency = editing one number in config.js.
 */

import { CONFIG } from '../config.js';

const GH = CONFIG.github;
const CACHE_KEY = `gh-projects:${GH.username}`;
const API_URL = `https://api.github.com/users/${GH.username}/repos?sort=pushed&direction=desc&per_page=100&type=owner`;

/* ---------------- cache helpers ---------------- */

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw); // { fetchedAt: number, projects: [] }
  } catch {
    return null;
  }
}

function writeCache(projects) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), projects })
    );
  } catch {
    /* storage full / disabled — non-fatal */
  }
}

function isFresh(cache) {
  return cache && Date.now() - cache.fetchedAt < GH.refreshIntervalMs;
}

/* ---------------- normalization ---------------- */

/** Map a raw GitHub repo (or profile.json entry) to the shape the UI renders. */
function normalizeRepo(repo) {
  return {
    id: repo.id ?? repo.name,
    name: repo.name,
    description: repo.description || 'No description yet — check the README.',
    url: repo.html_url ?? repo.url,
    homepage: repo.homepage || null,
    language: repo.language || null,
    tags: (repo.topics ?? repo.tags ?? []).slice(0, 5),
    stars: repo.stargazers_count ?? repo.stars ?? 0,
    pushedAt: repo.pushed_at ?? repo.pushedAt ?? repo.updated_at ?? null,
  };
}

/** Filter, pin, sort (latest first), and cap the list. */
function selectProjects(repos) {
  const excluded = new Set(GH.exclude.map((n) => n.toLowerCase()));

  const visible = repos
    .filter((r) => !r.fork)
    .filter((r) => !r.archived)
    .filter((r) => !excluded.has(r.name.toLowerCase()))
    .map(normalizeRepo)
    .sort((a, b) => new Date(b.pushedAt ?? 0) - new Date(a.pushedAt ?? 0));

  // Pinned repos float to the top in the order listed in config.
  const pinnedOrder = GH.pinned.map((n) => n.toLowerCase());
  visible.sort((a, b) => {
    const ai = pinnedOrder.indexOf(a.name.toLowerCase());
    const bi = pinnedOrder.indexOf(b.name.toLowerCase());
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
  });

  return visible.slice(0, GH.maxProjects);
}

/* ---------------- public API ---------------- */

/**
 * Resolve the project list.
 * @returns {Promise<{projects: Array, source: 'cache'|'api'|'stale-cache'|'fallback', fetchedAt: number}>}
 */
export async function getProjects() {
  const cache = readCache();

  if (isFresh(cache)) {
    return { projects: cache.projects, source: 'cache', fetchedAt: cache.fetchedAt };
  }

  try {
    const res = await fetch(API_URL, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const repos = await res.json();
    const projects = selectProjects(repos);
    writeCache(projects);
    return { projects, source: 'api', fetchedAt: Date.now() };
  } catch (err) {
    if (cache) {
      // Stale beats broken.
      return { projects: cache.projects, source: 'stale-cache', fetchedAt: cache.fetchedAt };
    }
    // Last resort: the static snapshot shipped with the site.
    const res = await fetch(GH.fallbackPath);
    if (!res.ok) throw err;
    const data = await res.json();
    return {
      projects: selectProjects(data.projects ?? []),
      source: 'fallback',
      fetchedAt: null,
    };
  }
}
