import { useEffect, useState } from 'react';
import { CONFIG } from '../config.js';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export default function AsciiSpinner() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % FRAMES.length), 90);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true">
        {FRAMES[i]}
      </span>{' '}
      fetching api.github.com/users/{CONFIG.github.username}/repos ...
    </div>
  );
}
