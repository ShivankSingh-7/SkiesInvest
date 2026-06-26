import { JsonOutputParser } from '@langchain/core/output_parsers';

/**
 * Robust JSON Parser Pipeline
 *
 * Step 1: Attempt native Langchain JsonOutputParser (handles basic markdown stripping)
 * Step 2: Aggressive regex cleaning (trailing commas, outer text) + JSON.parse()
 * Step 3: LLM Repair (if a repairModel is provided)
 * Step 4: Throw error if all recovery methods fail
 *
 * @param {string} rawContent - The raw text output from the LLM
 * @param {object} [repairModel=null] - Langchain model instance (e.g. ChatGroq) to use for repair
 * @param {string} [context=""] - Context string for logging
 * @returns {Promise<object>} The parsed JSON object
 */
export async function parseJSONWithRecovery(rawContent, repairModel = null, context = 'LLM') {
  // Step 1: Standard Output Parser
  const parser = new JsonOutputParser();
  try {
    const result = await parser.parse(rawContent);
    return result;
  } catch (parseError) {
    console.warn(`[${context}] Step 1 JSON parse failed. Attempting local cleanup...`);

    // Step 2: Aggressive Regex Cleaning
    try {
      const cleaned = attemptLocalCleanup(rawContent);
      const result = JSON.parse(cleaned);
      console.log(`[${context}] Step 2 JSON recovery successful via local cleanup.`);
      return result;
    } catch (cleanError) {
      console.warn(`[${context}] Step 2 local cleanup failed.`);

      // Step 3: LLM Repair Request
      if (repairModel) {
        console.warn(`[${context}] Step 3: Requesting LLM JSON repair...`);
        try {
          const repairPrompt = `Convert the following text into valid JSON without changing any values. 
Return ONLY valid JSON. The response MUST comply with RFC 8259. 
Do NOT use Markdown. Do NOT include trailing commas. Output ONLY the JSON object.

TEXT TO REPAIR:
${rawContent}`;

          const repairResponse = await repairModel.invoke([{ role: 'user', content: repairPrompt }]);
          
          // Use standard parser on the repair output
          const repairedJson = await parser.parse(repairResponse.content);
          console.log(`[${context}] Step 3 LLM JSON repair successful.`);
          return repairedJson;
        } catch (repairError) {
          console.error(`[${context}] Step 3 LLM repair failed.`);
          logFailure(rawContent, parseError, cleanError, repairError);
          throw new Error(`[${context}] LLM returned invalid JSON. All recovery methods failed. Initial error: ${parseError.message}`);
        }
      } else {
        // No repair model available
        logFailure(rawContent, parseError, cleanError, null);
        throw new Error(`[${context}] LLM returned invalid JSON. Local recovery failed. No repair model provided. Initial error: ${parseError.message}`);
      }
    }
  }
}

/**
 * Attempts to manually clean malformed JSON text
 */
function attemptLocalCleanup(text) {
  let cleaned = text.trim();

  // Remove markdown code fences if they exist
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  } else {
    // Alternatively, extract everything between the first '{' or '[' and the last '}' or ']'
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');

    const startObj = firstBrace !== -1 ? firstBrace : Infinity;
    const startArr = firstBracket !== -1 ? firstBracket : Infinity;
    const startIndex = Math.min(startObj, startArr);

    const endObj = lastBrace !== -1 ? lastBrace : -1;
    const endArr = lastBracket !== -1 ? lastBracket : -1;
    const endIndex = Math.max(endObj, endArr);

    if (startIndex !== Infinity && endIndex !== -1 && endIndex >= startIndex) {
      cleaned = cleaned.substring(startIndex, endIndex + 1);
    }
  }

  // Remove trailing commas before closing braces/brackets (common LLM error)
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  return cleaned;
}

/**
 * Logs the full lifecycle when all parsing methods fail
 */
function logFailure(rawContent, initialErr, cleanErr, repairErr) {
  console.error('=== JSON PARSE FAILURE LOG ===');
  console.error('RAW CONTENT:');
  console.error(rawContent.substring(0, 1000) + (rawContent.length > 1000 ? '...[truncated]' : ''));
  console.error('ERRORS:');
  console.error('- Initial Parse:', initialErr?.message);
  console.error('- Cleanup Parse:', cleanErr?.message);
  if (repairErr) console.error('- Repair Parse:', repairErr?.message);
  console.error('==============================');
}
