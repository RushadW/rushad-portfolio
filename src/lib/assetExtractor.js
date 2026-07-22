/**
 * README Asset & Media Extractor.
 * Parses raw Markdown and HTML tags to extract and resolve:
 *   1. Media (Images & GIFs) - resolving relative paths to raw.githubusercontent.com
 *   2. Video Links & Embeds (YouTube, Loom, Vimeo, direct .mp4/.webm)
 *   3. Resource & External Links (Documentation, Demos, References)
 * 
 * Filters out CI build badges, coverage shields, and self-referential header links.
 */

const BADGE_PATTERNS = [
  /shields\.io/i,
  /badge\.fury\.io/i,
  /codecov\.io/i,
  /travis-ci\.org/i,
  /github\.com\/[^\/]+\/[^\/]+\/workflows/i,
  /github\.com\/[^\/]+\/[^\/]+\/actions/i,
  /badge/i,
];

const VIDEO_EXTENSION_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;
const YOUTUBE_RE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const LOOM_RE = /loom\.com\/(?:share|embed)\/([a-f0-9]+)/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;

/** Convert relative path to raw GitHub content URL for media */
export function resolveRawMediaUrl(url, owner, repo, branch = 'main') {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return url.startsWith('//') ? `https:${url}` : url;
  }
  // Strip leading ./ or /
  const cleanPath = url.replace(/^(\.\/|\/)/, '');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;
}

/** Convert relative link to full GitHub tree URL */
export function resolveGithubLinkUrl(url, owner, repo, branch = 'main') {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return url.startsWith('//') ? `https:${url}` : url;
  }
  if (url.startsWith('#')) return ''; // ignore header anchor links
  const cleanPath = url.replace(/^(\.\/|\/)/, '');
  return `https://github.com/${owner}/${repo}/tree/${branch}/${cleanPath}`;
}

/** Check if image URL is a build badge */
function isBadgeUrl(url, alt = '') {
  if (BADGE_PATTERNS.some((p) => p.test(url))) return true;
  if (BADGE_PATTERNS.some((p) => p.test(alt))) return true;
  return false;
}

/** Extract video details if URL matches a video platform or format */
function parseVideoAsset(url, alt = '') {
  if (!url) return null;

  const ytMatch = url.match(YOUTUBE_RE);
  if (ytMatch) {
    return {
      type: 'youtube',
      url,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
      title: alt || 'YouTube Video Demo',
    };
  }

  const loomMatch = url.match(LOOM_RE);
  if (loomMatch) {
    return {
      type: 'loom',
      url,
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      title: alt || 'Loom Video Demo',
    };
  }

  const vimeoMatch = url.match(VIMEO_RE);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      url,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      title: alt || 'Vimeo Demo',
    };
  }

  if (VIDEO_EXTENSION_RE.test(url)) {
    return {
      type: 'direct',
      url,
      embedUrl: url,
      title: alt || 'Video Demonstration',
    };
  }

  return null;
}

export function extractAndResolveAssets(markdown, owner, repo, branch = 'main') {
  const media = [];
  const videoLinks = [];
  const links = [];
  const seenMedia = new Set();
  const seenVideos = new Set();
  const seenLinks = new Set();

  if (!markdown) return { media, videoLinks, links, cleanedMarkdown: '' };

  // 1. Extract HTML <video> tags
  const htmlVideoRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>(?:<\/video>)?/gi;
  let videoMatch;
  while ((videoMatch = htmlVideoRegex.exec(markdown)) !== null) {
    const rawUrl = videoMatch[1];
    const absUrl = resolveRawMediaUrl(rawUrl, owner, repo, branch);
    if (!seenVideos.has(absUrl)) {
      seenVideos.add(absUrl);
      videoLinks.push({
        type: 'direct',
        url: absUrl,
        embedUrl: absUrl,
        title: 'Project Demo Video',
      });
    }
  }

  // 2. Extract HTML <img> tags
  const htmlImgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']?([^"'>]*)["']?[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = htmlImgRegex.exec(markdown)) !== null) {
    const rawUrl = imgMatch[1];
    const alt = imgMatch[2] || '';
    if (!isBadgeUrl(rawUrl, alt)) {
      const absUrl = resolveRawMediaUrl(rawUrl, owner, repo, branch);
      const videoInfo = parseVideoAsset(absUrl, alt);
      if (videoInfo) {
        if (!seenVideos.has(videoInfo.embedUrl)) {
          seenVideos.add(videoInfo.embedUrl);
          videoLinks.push(videoInfo);
        }
      } else if (!seenMedia.has(absUrl)) {
        seenMedia.add(absUrl);
        media.push({ url: absUrl, alt: alt || `${repo} screenshot` });
      }
    }
  }

  // 3. Extract Markdown Images ![alt](url)
  const mdImgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let mdImg;
  while ((mdImg = mdImgRegex.exec(markdown)) !== null) {
    const alt = mdImg[1] || '';
    const rawUrl = mdImg[2].trim();
    if (!isBadgeUrl(rawUrl, alt)) {
      const absUrl = resolveRawMediaUrl(rawUrl, owner, repo, branch);
      const videoInfo = parseVideoAsset(absUrl, alt);
      if (videoInfo) {
        if (!seenVideos.has(videoInfo.embedUrl)) {
          seenVideos.add(videoInfo.embedUrl);
          videoLinks.push(videoInfo);
        }
      } else if (!seenMedia.has(absUrl)) {
        seenMedia.add(absUrl);
        media.push({ url: absUrl, alt: alt || `${repo} screenshot` });
      }
    }
  }

  // 4. Extract Markdown & HTML Links [text](url) and <a href="url">
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let mdLink;
  while ((mdLink = mdLinkRegex.exec(markdown)) !== null) {
    const text = mdLink[1].trim();
    const rawUrl = mdLink[2].trim();

    // Check if link is a video link
    const videoInfo = parseVideoAsset(rawUrl, text);
    if (videoInfo) {
      if (!seenVideos.has(videoInfo.embedUrl)) {
        seenVideos.add(videoInfo.embedUrl);
        videoLinks.push(videoInfo);
      }
      continue;
    }

    if (
      !rawUrl.startsWith('#') &&
      !isBadgeUrl(rawUrl, text) &&
      !text.startsWith('!') &&
      text.length > 1
    ) {
      const absUrl = resolveGithubLinkUrl(rawUrl, owner, repo, branch);
      if (absUrl && !seenLinks.has(absUrl)) {
        seenLinks.add(absUrl);
        links.push({ title: text, url: absUrl });
      }
    }
  }

  // 5. Pre-process Markdown for LLM summarization (strip badges & raw images)
  let cleanedMarkdown = markdown
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<video[^>]*>.*?<\/video>/gi, '')
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '') // badge link wrappers
    .replace(/<\/?[^>]+(>|$)/g, '') // strip raw html tags
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .slice(0, 150) // limit input tokens
    .join('\n');

  return { media, videoLinks, links, cleanedMarkdown };
}
