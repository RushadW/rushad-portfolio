/**
 * ============================================================
 *  SITE CONFIG — the only file you should need to touch
 *  for content/behavior changes.
 *
 *  Theme colors live in: src/styles/tokens.css
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
  // To update your resume: replace `public/resume.pdf` with a
  // new file of the same name. Nothing else changes.
  resumePath: '/resume.pdf',

  // ---- GitHub project feed ---------------------------------
  github: {
    username: 'RushadW',

    // How often the site re-pulls from the GitHub API.
    // Between refreshes, results are served from localStorage.
    // Change this ONE value to change the frequency.
    refreshIntervalMs: 6 * 60 * 60 * 1000, // 6 hours

    // Max projects rendered in the grid.
    maxProjects: 8,

    // Repos to always hide (forks are excluded automatically).
    exclude: ['RushadW'], // e.g. profile README repo

    // Repos to pin to the top regardless of recency, in order.
    pinned: [],

    // Fallback used if the API is unreachable AND the cache is
    // empty (rate limit, offline dev, etc.).
    fallbackPath: '/data/profile.json',
  },

  // ---- Terminal flavor -------------------------------------
  // Fake "commands" typed in the hero. Purely cosmetic.
  heroCommand: 'whoami --verbose',
  projectsCommand: 'git log --remotes --oneline | head',
};
