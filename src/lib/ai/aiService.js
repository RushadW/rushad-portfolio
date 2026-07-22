/**
 * Modular AI Service Facade.
 * Dispatches requests to the configured adapter (Gemini, OpenAI, Mock, etc.)
 * based on CONFIG.ai.provider. Consumer components call aiService.generateSummary()
 * without needing to know which provider or model is active.
 */

import { CONFIG } from '../../config.js';
import { GeminiAdapter } from './adapters/geminiAdapter.js';
import { OpenAIAdapter } from './adapters/openAIAdapter.js';
import { MockAdapter } from './adapters/mockAdapter.js';

class AIService {
  constructor() {
    this.adapters = new Map();
  }

  getAdapter(providerName) {
    const name = (providerName || CONFIG.ai?.provider || 'gemini').toLowerCase();
    if (this.adapters.has(name)) {
      return this.adapters.get(name);
    }

    let adapter;
    switch (name) {
      case 'gemini':
        adapter = new GeminiAdapter(CONFIG.ai);
        break;
      case 'openai':
        adapter = new OpenAIAdapter(CONFIG.ai);
        break;
      case 'mock':
      default:
        adapter = new MockAdapter(CONFIG.ai);
        break;
    }

    this.adapters.set(name, adapter);
    return adapter;
  }

  /**
   * Main unified entry point.
   * @param {string} prompt - The pre-processed README content.
   * @param {object} [options] - Optional override settings.
   * @returns {Promise<string>} Summary response text.
   */
  async generateSummary(prompt, options = {}) {
    const provider = options.provider || CONFIG.ai?.provider || 'gemini';
    try {
      const adapter = this.getAdapter(provider);
      return await adapter.generateSummary(prompt, options);
    } catch (err) {
      console.warn(`[AIService] Provider '${provider}' failed: ${err.message}. Falling back to MockAdapter.`);
      const fallback = new MockAdapter(CONFIG.ai);
      return await fallback.generateSummary(prompt, options);
    }
  }
}

export const aiService = new AIService();
