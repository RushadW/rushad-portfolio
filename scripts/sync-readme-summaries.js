import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../src/config.js';
import { getReadmeMetadata, summarizeRepoReadme } from '../src/lib/readmeSummarizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE = path.resolve(__dirname, '../public/data/readme-cache.json');

async function syncSummaries() {
  console.log(`\n======================================================`);
  console.log(`  GitHub README Summaries Sync (Provider: ${CONFIG.ai.provider})`);
  console.log(`======================================================\n`);

  let cacheData = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      console.log(`[Cache] Loaded existing cache with ${Object.keys(cacheData).length} repositories.`);
    } catch {
      console.warn(`[Cache] Could not parse existing cache file. Starting fresh.`);
    }
  }

  const username = CONFIG.github.username;
  const excludeSet = new Set(CONFIG.github.exclude.map((e) => e.toLowerCase()));

  // Fetch repos list from GitHub
  console.log(`[GitHub] Fetching public repositories for user '${username}'...`);
  const apiUrl = `https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=100`;
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let repos = [];
  try {
    const res = await fetch(apiUrl, { headers });
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    repos = await res.json();
  } catch (err) {
    console.error(`[GitHub Error] Failed to fetch repositories: ${err.message}`);
    process.exit(1);
  }

  const validRepos = repos
    .filter((r) => !r.fork && !r.archived && !excludeSet.has(r.name.toLowerCase()))
    .slice(0, CONFIG.github.maxProjects);

  console.log(`[GitHub] Processing ${validRepos.length} target repositories...\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const repo of validRepos) {
    const repoName = repo.name;
    const cachedEntry = cacheData[repoName] || null;

    try {
      // Step 1: Check README Metadata SHA
      const meta = await getReadmeMetadata(username, repoName, process.env.GITHUB_TOKEN);
      
      if (!meta) {
        console.log(`  - [${repoName}] No README found. Skipping.`);
        continue;
      }

      // Step 2: Compare SHA with cached SHA
      if (cachedEntry && cachedEntry.sha === meta.sha && cachedEntry.summary) {
        console.log(`  ✓ [${repoName}] SHA matched (${meta.sha.slice(0, 7)}). Served from cache (0 LLM API calls).`);
        skippedCount++;
        continue;
      }

      // Step 3: SHA changed -> Generate new summary via AI Service
      console.log(`  ⚡ [${repoName}] README SHA changed or missing. Invalidation triggered -> Calling AI Service...`);
      const result = await summarizeRepoReadme(username, repoName, cachedEntry, {
        githubToken: process.env.GITHUB_TOKEN,
      });

      cacheData[repoName] = {
        sha: result.sha,
        summary: result.summary,
        media: result.media,
        videoLinks: result.videoLinks,
        links: result.links,
        updatedAt: result.updatedAt,
      };

      updatedCount++;
      console.log(`  + [${repoName}] Summary updated successfully.`);
    } catch (err) {
      console.error(`  ✗ [${repoName}] Error during summary generation: ${err.message}`);
    }
  }

  // Ensure public/data directory exists
  const targetDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Save updated cache JSON
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
  console.log(`\n======================================================`);
  console.log(`  Sync Complete! Updated: ${updatedCount} | Cached (0 API calls): ${skippedCount}`);
  console.log(`  Cache saved to: ${CACHE_FILE}`);
  console.log(`======================================================\n`);
}

syncSummaries().catch(console.error);
