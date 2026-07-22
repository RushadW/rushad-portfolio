import { useState } from 'react';

export default function MediaCarousel({ media = [], videoLinks = [], links = [], fallbackImage = '' }) {
  // Available asset lists
  const allMedia = media.length > 0 ? media : fallbackImage ? [{ url: fallbackImage, alt: 'Project Preview' }] : [];
  
  // Active tab state: 'media' | 'videos' | 'links'
  const initialTab = allMedia.length > 0 ? 'media' : videoLinks.length > 0 ? 'videos' : 'links';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Active index for media and videos
  const [mediaIndex, setMediaIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState({});

  const hasMedia = allMedia.length > 0;
  const hasVideos = videoLinks.length > 0;
  const hasLinks = links.length > 0;

  // Handlers for slide navigation
  const prevMedia = () => setMediaIndex((i) => (i === 0 ? allMedia.length - 1 : i - 1));
  const nextMedia = () => setMediaIndex((i) => (i === allMedia.length - 1 ? 0 : i + 1));
  const prevVideo = () => setVideoIndex((i) => (i === 0 ? videoLinks.length - 1 : i - 1));
  const nextVideo = () => setVideoIndex((i) => (i === videoLinks.length - 1 ? 0 : i + 1));

  const currentImage = allMedia[mediaIndex];
  const currentVideo = videoLinks[videoIndex];

  return (
    <div className="carousel-root">
      {/* Neobrutalist Tabs Navigation */}
      <div className="carousel-tabs">
        {hasMedia && (
          <button
            type="button"
            className={`carousel-tab ${activeTab === 'media' ? 'carousel-tab--active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            🖼️ Images ({allMedia.length})
          </button>
        )}
        {hasVideos && (
          <button
            type="button"
            className={`carousel-tab ${activeTab === 'videos' ? 'carousel-tab--active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            🎬 Videos ({videoLinks.length})
          </button>
        )}
        {hasLinks && (
          <button
            type="button"
            className={`carousel-tab ${activeTab === 'links' ? 'carousel-tab--active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            🔗 Links ({links.length})
          </button>
        )}
      </div>

      {/* Slide Display Container */}
      <div className="carousel-viewport">
        {/* TAB 1: IMAGES */}
        {activeTab === 'media' && hasMedia && (
          <div className="carousel-slide carousel-slide--media">
            {brokenImages[currentImage.url] ? (
              <div className="carousel-fallback">
                <span>[Image unavailable: {currentImage.alt}]</span>
              </div>
            ) : (
              <img
                src={currentImage.url}
                alt={currentImage.alt || 'Project media'}
                loading="lazy"
                onError={() => setBrokenImages((b) => ({ ...b, [currentImage.url]: true }))}
              />
            )}
            {allMedia.length > 1 && (
              <div className="carousel-controls">
                <button type="button" className="carousel-nav-btn" onClick={prevMedia}>
                  &lt; PREV
                </button>
                <span className="carousel-indicator">
                  {mediaIndex + 1} / {allMedia.length}
                </span>
                <button type="button" className="carousel-nav-btn" onClick={nextMedia}>
                  NEXT &gt;
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIDEOS */}
        {activeTab === 'videos' && hasVideos && (
          <div className="carousel-slide carousel-slide--video">
            <div className="video-wrapper">
              {currentVideo.type === 'direct' ? (
                <video controls src={currentVideo.url} className="video-player">
                  Your browser does not support HTML5 video.
                </video>
              ) : (
                <iframe
                  src={currentVideo.embedUrl}
                  title={currentVideo.title || 'Video Demo'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-iframe"
                />
              )}
            </div>
            {videoLinks.length > 1 && (
              <div className="carousel-controls">
                <button type="button" className="carousel-nav-btn" onClick={prevVideo}>
                  &lt; PREV
                </button>
                <span className="carousel-indicator">
                  {videoIndex + 1} / {videoLinks.length}
                </span>
                <button type="button" className="carousel-nav-btn" onClick={nextVideo}>
                  NEXT &gt;
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LINKS PAGE */}
        {activeTab === 'links' && (
          <div className="carousel-slide carousel-slide--links">
            <div className="links-header">
              <span className="links-title">&gt; preserved_readme_links.sh</span>
            </div>
            {hasLinks ? (
              <div className="links-grid">
                {links.map((link, idx) => (
                  <a
                    key={`${link.url}-${idx}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="readme-link-pill"
                  >
                    <span className="link-icon">🔗</span>
                    <span className="link-text">{link.title || link.url}</span>
                    <span className="link-arrow">↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="carousel-fallback">
                <span>No additional external links in README.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
