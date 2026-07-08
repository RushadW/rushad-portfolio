import { useEffect, useState } from 'react';
import { getProjects } from '../lib/github.js';

/**
 * Async state machine for the project feed.
 * status: 'loading' → 'ready' | 'error'
 */
export function useProjects() {
  const [state, setState] = useState({
    status: 'loading',
    projects: [],
    source: null,
    fetchedAt: null,
    error: null,
  });

  useEffect(() => {
    let alive = true;

    getProjects()
      .then(({ projects, source, fetchedAt }) => {
        if (!alive) return;
        setState({ status: 'ready', projects, source, fetchedAt, error: null });
      })
      .catch((err) => {
        if (!alive) return;
        setState((s) => ({ ...s, status: 'error', error: err.message }));
      });

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
