import { useEffect, useMemo, useRef, useState } from 'react';
import { CONFIG } from '../config.js';
import { EXPERIENCE_TREE } from '../data/experience.js';
import { PromptLine } from './Hero.jsx';

/** Flatten the nested data into printable lines with tree glyphs. */
function flatten(nodes, prefix = '') {
  const lines = [];
  nodes.forEach((node, i) => {
    const isLast = i === nodes.length - 1;
    lines.push({
      glyph: prefix + (isLast ? '└── ' : '├── '),
      label: node.label,
      detail: node.detail,
      isDir: Boolean(node.children),
    });
    if (node.children) {
      lines.push(...flatten(node.children, prefix + (isLast ? '    ' : '│   ')));
    }
  });
  return lines;
}

function countTree(nodes) {
  let dirs = 0;
  let files = 0;
  for (const n of nodes) {
    if (n.children) {
      dirs += 1;
      const sub = countTree(n.children);
      dirs += sub.dirs;
      files += sub.files;
    } else {
      files += 1;
    }
  }
  return { dirs, files };
}

export default function ExperienceTree() {
  const lines = useMemo(() => flatten(EXPERIENCE_TREE), []);
  const { dirs, files } = useMemo(() => countTree(EXPERIENCE_TREE), []);

  // Start the "printing" animation only once the section scrolls
  // into view, so visitors actually see it happen.
  const ref = useRef(null);
  const [printed, setPrinted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || printed) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setPrinted(true),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [printed]);

  // Per-line CSS animations can occasionally get dropped by the browser
  // (e.g. if a scroll/compositing pass lands mid-delay), leaving a line
  // stuck at opacity 0 — a "gap" in the middle of the tree. Once the
  // whole staggered sequence should be finished, force every line
  // visible so a missed animation can never leave a hole.
  useEffect(() => {
    if (!printed) return;
    const totalMs = (lines.length + 2) * 70 + 200;
    const t = setTimeout(() => setDone(true), totalMs);
    return () => clearTimeout(t);
  }, [printed, lines.length]);

  return (
    <section className="section" id="experience" aria-label="Experience" ref={ref}>
      <PromptLine command={CONFIG.experienceCommand} />

      <h2 className="section__heading">Experience</h2>
      <p className="section__meta">work history + education, depth-first</p>

      <pre className={`tree ${printed ? 'tree--printed' : ''} ${done ? 'tree--done' : ''}`}>
        <span className="tree__line" style={{ '--i': 0 }}>
          <span className="tree__dir">experience/</span>
        </span>
        {lines.map((line, i) => (
          <span key={i} className="tree__line" style={{ '--i': i + 1 }}>
            <span className="tree__glyph">{line.glyph}</span>
            <span className={line.isDir ? 'tree__dir' : 'tree__file'}>
              {line.label}
            </span>
            {line.detail && <span className="tree__detail"> {line.detail}</span>}
          </span>
        ))}
        <span className="tree__line tree__summary" style={{ '--i': lines.length + 1 }}>
          {'\n'}{dirs + 1} directories, {files} files
        </span>
      </pre>
    </section>
  );
}
