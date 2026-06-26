import { ChatGroq } from '@langchain/groq';

/**
 * Groq LLM Client
 *
 * Using llama-3.1-8b-instant — fastest model with highest rate limits.
 * Temperature 0 for deterministic, evidence-based responses.
 */

let groqClient = null;

export function getGroqClient() {
  if (!groqClient) {
    groqClient = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      maxTokens: 3000,
      maxRetries: 0,
    });
  }
  return groqClient;
}

/**
 * Call Groq and parse the JSON response
 * Handles both direct JSON and markdown-wrapped JSON (```json ... ```)
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @returns {Promise<object>}
 */
export async function callGroqJSON(systemPrompt, userMessage) {
  const client = getGroqClient();

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const response = await client.invoke(messages);
  const content = response.content;

  // Extract JSON from markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const rawJson = jsonMatch ? jsonMatch[1].trim() : content.trim();

  try {
    return JSON.parse(rawJson);
  } catch (parseError) {
    console.error('[Groq] JSON parse failed. Raw content:', content.substring(0, 200));
    throw new Error(`LLM returned invalid JSON: ${parseError.message}`);
  }
}
