import { callGroqJSON } from './groq.js';
import { callHfJSON } from './hf.js';

/**
 * Multi-LLM Router
 *
 * Routes tasks to the optimal provider based on reasoning requirements.
 * Hugging Face is used for lightweight NLP (Consolidator).
 * Groq is used for complex reasoning (Financial, Risk, Decision).
 */

const PROVIDER_MAP = {
  consolidator: 'huggingface',
  financial: 'groq',
  risk: 'groq',
  decision: 'groq',
};

// Delays in ms for exponential backoff during retry
const RETRY_DELAYS = [2000, 5000, 10000];

/**
 * Standardized LLM Interface
 * @param {Object} params
 * @param {string} params.taskType - The node identifier (e.g. 'consolidator', 'risk')
 * @param {string} params.systemPrompt - The full system prompt
 * @param {string} params.userMessage - The data payload for the LLM
 * @param {number} params.maxTokens - Max tokens for generation
 * @param {boolean} [params.allowFallback=false] - Whether to fallback to HF on total failure
 */
export async function callLLM({ taskType, systemPrompt, userMessage, maxTokens = 2000, allowFallback = false }) {
  const provider = PROVIDER_MAP[taskType] || 'groq';

  // 1. Primary Attempt (with internal retries for generic network/503 issues)
  try {
    return await executeWithRetry(provider, systemPrompt, userMessage, maxTokens);
  } catch (err) {
    console.error(`[Router] ${provider.toUpperCase()} failed for ${taskType}: ${err.message}`);

    // 2. Fallback to secondary provider if permitted
    if (allowFallback) {
      const fallbackProvider = provider === 'huggingface' ? 'groq' : 'huggingface';
      console.warn(`[Router] Falling back to ${fallbackProvider.toUpperCase()} for task: ${taskType}`);
      return await executeWithRetry(fallbackProvider, systemPrompt, userMessage, maxTokens);
    }

    throw err; // No fallback allowed
  }
}

/**
 * Execute the LLM call with generic exponential backoff (for 503s, timeouts, etc)
 * Note: Groq's 429 logic handles its own precise timeout internally inside groq.js!
 */
async function executeWithRetry(provider, systemPrompt, userMessage, maxTokens) {
  let attempt = 0;
  
  while (true) {
    try {
      if (provider === 'huggingface') {
        return await callHfJSON(systemPrompt, userMessage, maxTokens);
      } else {
        return await callGroqJSON(systemPrompt, userMessage, maxTokens);
      }
    } catch (err) {
      // If it's a model loading error (503) or generic network fail, we wait and retry
      if (attempt < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt];
        console.warn(`[Router] ${provider} error, retrying in ${delay}ms... (${err.message})`);
        await new Promise(r => setTimeout(r, delay));
        attempt++;
      } else {
        throw new Error(`Exhausted retries for ${provider}. Last error: ${err.message}`);
      }
    }
  }
}
