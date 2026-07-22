/**
 * GitHub README Summarizer Engine.
 * Fetches GitHub README content, checks SHA, resolves media/videos/links,
 * and delegates textual summarization to the modular AI Service.
 */

import { aiService } from './ai/aiService.js';
import { extractAndResolveAssets } from './assetExtractor.js';

/**
 * Fetch README metadata (including git blob SHA and branch).
 */
export async function getReadmeMetadata(owner, repo, token = null) {
  const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GitHub API Error (${res.status}) fetching README for ${owner}/${repo}`);
  }

  const data = await res.json();
  // Decode base64 content if provided directly in payload
  let rawContent = '';
  if (data.content && data.encoding === 'base64') {
    try {
      if (typeof Buffer !== 'undefined') {
        rawContent = Buffer.from(data.content, 'base64').toString('utf-8');
      } else if (typeof atob !== 'undefined') {
        rawContent = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
      }
    } catch {
      rawContent = '';
    }
  }

  return {
    sha: data.sha,
    downloadUrl: data.download_url,
    rawContent,
    defaultBranch: data.url ? data.url.split('ref=')[1] || 'main' : 'main',
  };
}

/**
 * Summarize a project README.
 * @param {string} owner - GitHub username/org
 * @param {string} repo - Repository name
 * @param {object} [cachedEntry] - Existing cache entry for SHA verification
 * @param {object} [options] - Additional settings (API keys, provider choice)
 */
export async function summarizeRepoReadme(owner, repo, cachedEntry = null, options = {}) {
  const meta = await getReadmeMetadata(owner, repo, options.githubToken);
  if (!meta) {
    return {
      sha: null,
      summary: 'No README found for this repository.',
      media: [],
      videoLinks: [],
      links: [],
      updatedAt: Date.now(),
      fromCache: false,
    };
  }

  // SHA Guard: Check if remote README SHA matches cached SHA
  if (cachedEntry && cachedEntry.sha === meta.sha && cachedEntry.summary) {
    return {
      ...cachedEntry,
      fromCache: true,
    };
  }

  // If content wasn't in metadata payload, fetch raw download URL
  let markdown = meta.rawContent;
  if (!markdown && meta.downloadUrl) {
    const rawRes = await fetch(meta.downloadUrl);
    if (rawRes.ok) {
      markdown = await rawRes.text();
    }
  }

  if (!markdown) {
    return {
      sha: meta.sha,
      summary: 'README content could not be read.',
      media: [],
      videoLinks: [],
      links: [],
      updatedAt: Date.now(),
      fromCache: false,
    };
  }

  // 1. Extract and resolve media, videos, and links
  const { media, videoLinks, links, cleanedMarkdown } = extractAndResolveAssets(
    markdown,
    owner,
    repo,
    meta.defaultBranch
  );

  // 2. Generate textual summary using modular AI Service
  const textSummary = await aiService.generateSummary(cleanedMarkdown, options);

  return {
    sha: meta.sha,
    summary: textSummary,
    media,
    videoLinks,
    links,
    updatedAt: Date.now(),
    fromCache: false,
  };
}
