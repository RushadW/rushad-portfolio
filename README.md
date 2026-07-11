# rushad-portfolio

A terminal-themed personal portfolio site. Every section is driven by a fake
shell prompt — `whoami --verbose`, `ls -F ./skills/`, `tree ./experience`,
`git log --remotes --oneline` — and the projects tab pulls **live repositories
straight from the GitHub API** with no backend to run or maintain.

Built with React 18 + Vite. Fully static — deploys anywhere that serves files.

---

## Highlights

- **Zero backend.** No server, no database, no API keys. Just static assets.
- **Live GitHub project feed** with a resilient, self-caching fetch strategy
  (see [How the project feed works](#how-the-project-feed-works)).
- **Config-driven content.** Identity, links, skills, experience, and theme
  colors are all data — edit a file, not a component.
- **Terminal aesthetic** with an ASCII boot spinner, title bar, and status bar.

---

## Tech Stack

| Layer          | Choice                                             |
| -------------- | -------------------------------------------------- |
| UI framework   | React 18 (`react` / `react-dom`)                   |
| Build tool     | Vite 5 (`@vitejs/plugin-react`)                    |
| Language       | JavaScript (ESM, `.jsx`)                            |
| Styling        | Plain CSS with custom properties — no framework    |
| Data source    | GitHub public REST API + `localStorage` cache      |
| Hosting        | Any static host (GitHub Pages, Netlify, Vercel, …) |

---

## Quick Start

**Prerequisites:** Node.js 18+ and npm.

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server (http://localhost:5173)
npm run build    # produce a production build in dist/
npm run preview  # serve the production build locally
```

---

## Project Structure

```
src/
├── main.jsx              # React entry point
├── App.jsx               # Root composition
├── config.js             # Central site config (identity, links, GitHub feed)
├── components/
│   ├── Hero.jsx          # whoami --verbose
│   ├── Skills.jsx        # ls -F ./skills/
│   ├── ExperienceTree.jsx# tree ./experience
│   ├── Projects.jsx      # git log --remotes --oneline
│   ├── ProjectPanel.jsx  # per-repo detail panel
│   ├── TitleBar.jsx      # terminal window chrome
│   ├── StatusBar.jsx     # bottom status line
│   └── AsciiSpinner.jsx  # boot spinner
├── hooks/
│   └── useProjects.js    # consumes the GitHub feed
├── lib/
│   ├── github.js         # cached GitHub API client
│   └── format.js         # formatting helpers
├── data/
│   ├── skills.js         # skills content
│   └── experience.js     # experience tree content
└── styles/
    ├── tokens.css        # theme colors / design tokens
    └── global.css        # global styles

public/
├── resume.pdf            # local resume fallback
├── avatar.png            # local avatar option
└── data/profile.json     # static project snapshot (offline fallback)
```

---

## Configuration

Almost everything lives in **`src/config.js`**. No component edits required.

| What you want to change            | Where                                          |
| ---------------------------------- | ---------------------------------------------- |
| Name, tagline, email, location     | `CONFIG` fields in `src/config.js`             |
| GitHub / LinkedIn links            | `CONFIG.links`                                 |
| Resume (hosted or local)           | `CONFIG.resume` (see below)                    |
| GitHub username & feed behavior    | `CONFIG.github`                                |
| Skills                             | `src/data/skills.js`                           |
| Experience & education             | `src/data/experience.js`                       |
| Theme colors                       | `src/styles/tokens.css`                        |
| Prompt command text                | `heroCommand`, `skillsCommand`, etc. in config |

### Resume

Set `CONFIG.resume.url` to a Google Drive "Anyone with the link" URL to host the
resume off-repo (update it in Drive without a git push). If left empty, the site
serves the local `public/resume.pdf` fallback.

### GitHub feed settings (`CONFIG.github`)

- `username` — the account whose repos are shown.
- `refreshIntervalMs` — how often the site re-pulls from the API (default: 7 days).
- `maxProjects` — max repos rendered as tabs.
- `exclude` — repos to always hide (case-insensitive). Forks and archived repos
  are dropped automatically.
- `pinned` — repos to float to the front, in the order listed.
- `media` — optional per-repo screenshots (drop files in `public/media/`);
  repos without an entry show their GitHub social-preview card.
- `showAvatar` / `avatarSource` / `avatarPath` — avatar display options.

---

## How the project feed works

`src/lib/github.js` resolves the project list with the cheapest path that works,
falling back gracefully at each step:

1. **Fresh cache** → serve from `localStorage`, **0 network calls**.
2. **Stale/empty cache** → one unauthenticated call to the GitHub REST API
   (60 req/hr per visitor IP — plenty, since each visitor refreshes at most
   once per interval).
3. **API fails but a stale cache exists** → serve the stale cache.
4. **No cache at all** → fall back to the static `public/data/profile.json`
   snapshot bundled with the site.

The result object reports its `source` (`cache` / `api` / `stale-cache` /
`fallback`) so the UI can indicate freshness.

