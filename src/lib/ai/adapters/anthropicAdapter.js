/**
 * Anthropic Claude API Adapter for Modular AI Service.
 */

export class AnthropicAdapter {
  constructor(config = {}) {
    this.model = config.model || 'claude-haiku-4-5-20251001';
    this.maxTokens = config.maxTokens || 500;
  }

  getApiKey() {
    if (typeof process !== 'undefined' && process.env?.ANTHROPIC_API_KEY) {
      return process.env.ANTHROPIC_API_KEY;
    }
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANTHROPIC_API_KEY) {
      return import.meta.env.VITE_ANTHROPIC_API_KEY;
    }
    return null;
  }

  async generateSummary(prompt, options = {}) {
    const apiKey = options.apiKey || this.getApiKey();
    if (!apiKey) {
      throw new Error(
        'Anthropic API Key missing. Set ANTHROPIC_API_KEY (Node) or VITE_ANTHROPIC_API_KEY (Vite env).'
      );
    }

    const modelName = options.model || this.model;
    const url = 'https://api.anthropic.com/v1/messages';

    const systemInstruction = options.systemInstruction || 
      'You are a technical project summarizer. Provide a concise 2-3 sentence overview of what the project does, followed by 3-4 key bullet points highlighting its core capabilities. Do not include markdown headers or badges.';

    const requestBody = {
      model: modelName,
      max_tokens: options.maxTokens || this.maxTokens,
      system: systemInstruction,
      messages: [
        { role: 'user', content: `Project README Content:\n${prompt}` },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const outputText = data.content?.[0]?.text;

    if (!outputText) {
      throw new Error('Anthropic API returned an empty response.');
    }

    return outputText.trim();
  }
}
