/**
 * Mock Adapter for offline testing / fallback without network LLM API calls.
 */

export class MockAdapter {
  constructor(config = {}) {
    this.model = 'mock-local-v1';
  }

  async generateSummary(prompt, options = {}) {
    // Basic deterministic extraction fallback
    const lines = prompt
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('!'));

    const overview = lines.slice(0, 2).join(' ') || 'High-performance software engineering repository.';
    const bullets = lines
      .filter((l) => l.startsWith('-') || l.startsWith('*'))
      .slice(0, 3)
      .join('\n');

    return `${overview}\n\nKey Highlights:\n${bullets || '- High-performance modular architecture.\n- Fully automated deployment and testing.'}`;
  }
}
