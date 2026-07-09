import { useLayoutEffect, useRef, useState } from 'react';
import { CONFIG } from '../config.js';

const TITLE_TEXT = `${CONFIG.handle}@${CONFIG.hostname}: ~`;

export default function TitleBar() {
  const barRef = useRef(null);
  const dotsRef = useRef(null);
  const navRef = useRef(null);
  const titleMeasureRef = useRef(null);
  const [showTitle, setShowTitle] = useState(true);

  // Hide the title the instant it would collide with the nav — measured
  // against real widths, not a fixed viewport breakpoint — instead of
  // letting the nav wrap and grow the titlebar's height.
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const recalc = () => {
      const style = getComputedStyle(bar);
      const gap = parseFloat(style.columnGap || style.gap) || 0;
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const available = bar.getBoundingClientRect().width - padding;

      const dotsWidth = dotsRef.current?.getBoundingClientRect().width ?? 0;
      const navWidth = navRef.current?.getBoundingClientRect().width ?? 0;
      const titleWidth = titleMeasureRef.current?.getBoundingClientRect().width ?? 0;

      const needed = dotsWidth + titleWidth + navWidth + gap * 2;
      setShowTitle(needed <= available);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(bar);
    // The nav/title widths change when the web font swaps in, without
    // the (full-width) bar itself resizing — watch them too, and re-run
    // once fonts are ready so the decision isn't stale fallback metrics.
    if (navRef.current) ro.observe(navRef.current);
    if (titleMeasureRef.current) ro.observe(titleMeasureRef.current);
    document.fonts?.ready?.then(recalc);
    return () => ro.disconnect();
  }, []);

  return (
    <header className="titlebar" ref={barRef}>
      <div className="titlebar__dots" ref={dotsRef} aria-hidden="true">
        <span className="titlebar__dot" />
        <span className="titlebar__dot" />
        <span className="titlebar__dot titlebar__dot--accent" />
      </div>

      {showTitle && <span className="titlebar__title">{TITLE_TEXT}</span>}

      <nav className="titlebar__nav" ref={navRef} aria-label="Main">
        <a href="#skills">skills</a>
        <a href="#experience">experience</a>
        <a href="#projects">projects</a>
        <a href={`mailto:${CONFIG.email}`}>contact</a>
      </nav>

      {/* Off-screen twin, always rendered, used only to measure the
          title's natural width regardless of whether it's shown. */}
      <span
        ref={titleMeasureRef}
        className="titlebar__title"
        aria-hidden="true"
        style={{ position: 'absolute', visibility: 'hidden', top: -9999, left: -9999 }}
      >
        {TITLE_TEXT}
      </span>
    </header>
  );
}
