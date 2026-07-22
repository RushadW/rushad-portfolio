/**
 * Gemini API Adapter for Modular AI Service.
 * Uses REST API for maximum portability (browser & Node.js).
 */

export class GeminiAdapter {
  constructor(config = {}) {
    this.model = config.model || 'gemini-2.5-flash-lite';
    this.maxTokens = config.maxTokens || 500;
  }

  getApiKey() {
    if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
    return null;
  }

  async generateSummary(prompt, options = {}) {
    const apiKey = options.apiKey || this.getApiKey();
    if (!apiKey) {
      throw new Error(
        'Gemini API Key missing. Set GEMINI_API_KEY (Node) or VITE_GEMINI_API_KEY (Vite env).'
      );
    }

    const modelName = options.model || this.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const systemInstruction = options.systemInstruction || 
      'You are a technical project summarizer. Provide a concise 2-3 sentence overview of what the project does, followed by 3-4 key bullet points highlighting its core capabilities. Do not include markdown headers or badges.';

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nProject README Content:\n${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: options.maxTokens || this.maxTokens,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!outputText) {
      throw new Error('Gemini API returned an empty response.');
    }

    return outputText.trim();
  }
}
