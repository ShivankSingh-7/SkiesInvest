import { ChatGroq } from '@langchain/groq';
import { parseJSONWithRecovery } from '../utils/jsonParser.js';

/**
 * Groq LLM Client
 *
 * Using llama-3.1-8b-instant — fastest model with highest rate limits.
 * Temperature 0 for deterministic, evidence-based responses.
 */

let groqClient = null;

export function getGroqClient(maxTokens = 3000) {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    maxTokens: maxTokens,
    maxRetries: 0,
  });
}

/**
 * Call Groq and parse the JSON response
 * Handles both direct JSON and markdown-wrapped JSON (```json ... ```)
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {number} [maxTokens=3000] - Override max output tokens to save TPM
 * @returns {Promise<object>}
 */
export async function callGroqJSON(systemPrompt, userMessage, maxTokens = 3000) {
  const client = getGroqClient(maxTokens);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  let content;
  try {
    const response = await client.invoke(messages);
    content = response.content;
  } catch (error) {
    if (error.message && error.message.includes('429') && error.message.includes('try again in')) {
      const match = error.message.match(/try again in ([\d\.]+)s/);
      if (match && match[1]) {
        const waitTimeMs = Math.ceil(parseFloat(match[1]) * 1000) + 500; // Add 500ms buffer
        console.warn(`[Groq] Rate limit hit. Waiting ${waitTimeMs}ms before retrying...`);
        await new Promise(r => setTimeout(r, waitTimeMs));
        
        // Retry once
        const retryResponse = await client.invoke(messages);
        content = retryResponse.content;
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  // Use robust parser with recovery pipeline
  return parseJSONWithRecovery(content, client, 'Groq');
}
