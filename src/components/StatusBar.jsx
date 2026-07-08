import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config.js';
import { hms } from '../lib/format.js';

export default function StatusBar() {
  const mountedAt = useRef(Date.now());
  const [uptime, setUptime] = useState('00:00:00');

  useEffect(() => {
    const id = setInterval(
      () => setUptime(hms(Date.now() - mountedAt.current)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="statusbar" aria-label="Status">
      <span className="statusbar__item">
        <span className="statusbar__led" aria-hidden="true" />
        STATUS: open_to_work
      </span>
      <span className="statusbar__item">UPTIME: {uptime}</span>
      <span className="statusbar__item">LOC: {CONFIG.location}</span>
      <span className="statusbar__spacer" />
      <span className="statusbar__item">
        <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>
      </span>
    </footer>
  );
}
