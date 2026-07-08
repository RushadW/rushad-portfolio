/**
 * ============================================================
 *  SITE CONFIG — identity, links, resume source, GitHub feed.
 *
 *  Skills live in:      src/data/skills.js
 *  Experience tree in:  src/data/experience.js
 *  Theme colors in:     src/styles/tokens.css
 * ============================================================
 */

export const CONFIG = {
  // ---- Identity --------------------------------------------
  name: 'Rushad Wankadia',
  handle: 'rushad',
  hostname: 'portfolio',
  tagline: 'Software engineer. I make constrained systems fast.',
  subline:
    'Firmware-adjacent C++/C#, backend infrastructure, and ML pipelines that hold up under load. ' +
    'MS Software Engineering @ ASU (3.97). Currently @ Rocket Mortgage.',
  location: 'Detroit, MI · Open to relocate',
  email: 'wrushad@gmail.com',

  links: {
    github: 'https://github.com/RushadW',
    linkedin: 'https://linkedin.com/in/rushad-wankadia',
  },

  // ---- Resume ----------------------------------------------
  // HOSTED RESUME (no git push needed to update it):
  //   1. Upload resume.pdf to Google Drive.
  //   2. Share -> "Anyone with the link" -> copy the link and
  //      paste it into `url` below (looks like
  //      https://drive.google.com/file/d/FILE_ID/view).
  //   3. To update the resume later, open the file in Drive ->
  //      three-dot menu -> "Manage versions" -> "Upload new
  //      version". The link (and this site) never change.
  //
  // If `url` is empty, the site falls back to the local file at
  // public/resume.pdf.
  resume: {
    url: '', // <- paste your Drive share link here
    fallbackPath: '/resume.pdf',
  },

  // ---- GitHub project feed ---------------------------------
  github: {
    username: 'RushadW',

    // How often the site re-pulls from the GitHub API.
    // Between refreshes, results are served from localStorage.
    // Change this ONE value to change the frequency.
    refreshIntervalMs: 6 * 60 * 60 * 1000, // 6 hours

    // Max projects rendered as tabs.
    maxProjects: 8,

    // Repos to always hide (forks are excluded automatically).
    exclude: ['RushadW'],

    // Repos to pin to the front tabs regardless of recency.
    pinned: [],

    // Screenshots per repo. Keys are repo names; values are
    // arrays of image paths (drop files into public/media/).
    // Repos WITHOUT an entry automatically show their GitHub
    // social-preview card instead.
    //   media: { 'rxrefactor': ['/media/rx-1.png', '/media/rx-2.png'] },
    media: {},

    // Fallback used if the API is unreachable AND the cache is empty.
    fallbackPath: '/data/profile.json',
  },

  // ---- Terminal flavor (the fake prompt commands) ----------
  heroCommand: 'whoami --verbose',
  skillsCommand: 'ls -F ./skills/',
  experienceCommand: 'tree ./experience',
  projectsCommand: 'git log --remotes --oneline | head',
};

/** The resolved resume link every button/nav item should use. */
export function resumeHref() {
  return CONFIG.resume.url || CONFIG.resume.fallbackPath;
}

/**
 * GitHub serves every user's avatar at a stable, static URL — no API
 * call, no rate limit, no caching logic needed (unlike the repo feed).
 */
export function githubAvatarUrl(size = 240) {
  return `https://github.com/${CONFIG.github.username}.png?size=${size}`;
}
