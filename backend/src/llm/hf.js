import { parseJSONWithRecovery } from '../utils/jsonParser.js';
import { getGroqClient } from './groq.js';

/**
 * Hugging Face LLM Client
 *
 * Uses the Hugging Face Inference API for lightweight NLP tasks.
 * Optimized for meta-llama/Meta-Llama-3-8B-Instruct.
 */

export async function callHfJSON(systemPrompt, userMessage, maxTokens = 2000) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  const modelUrl = 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions';
  
  const payload = {
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature: 0.1,
    stream: false,
  };

  let response;
  try {
    response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new Error(`HF network error: ${err.message}`);
  }

  if (!response.ok) {
    let errorText = await response.text();
    // Handle specific rate limits or loading states from HF
    if (response.status === 429) {
      throw new Error(`HF 429 Rate Limit: ${errorText}`);
    }
    if (response.status === 503) {
      // 503 is returned when the model is currently loading on HF servers
      throw new Error(`HF 503 Model Loading: ${errorText}`);
    }
    throw new Error(`HF API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';

  // Use robust parser with recovery pipeline, using Groq as the repair agent
  const repairAgent = getGroqClient(maxTokens);
  return parseJSONWithRecovery(content, repairAgent, 'HF');
}
