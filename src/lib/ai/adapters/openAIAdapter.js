/**
 * OpenAI API Adapter for Modular AI Service.
 */

export class OpenAIAdapter {
  constructor(config = {}) {
    this.model = config.model || 'gpt-4o-mini';
    this.maxTokens = config.maxTokens || 500;
  }

  getApiKey() {
    if (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) {
      return import.meta.env.VITE_OPENAI_API_KEY;
    }
    return null;
  }

  async generateSummary(prompt, options = {}) {
    const apiKey = options.apiKey || this.getApiKey();
    if (!apiKey) {
      throw new Error(
        'OpenAI API Key missing. Set OPENAI_API_KEY (Node) or VITE_OPENAI_API_KEY (Vite env).'
      );
    }

    const modelName = options.model || this.model;
    const url = 'https://api.openai.com/v1/chat/completions';

    const systemInstruction = options.systemInstruction || 
      'You are a technical project summarizer. Provide a concise 2-3 sentence overview of what the project does, followed by 3-4 key bullet points highlighting its core capabilities. Do not include markdown headers or badges.';

    const requestBody = {
      model: modelName,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Project README Content:\n${prompt}` },
      ],
      temperature: 0.2,
      max_tokens: options.maxTokens || this.maxTokens,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const outputText = data.choices?.[0]?.message?.content;

    if (!outputText) {
      throw new Error('OpenAI API returned an empty response.');
    }

    return outputText.trim();
  }
}
