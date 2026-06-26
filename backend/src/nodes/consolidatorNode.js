import { callLLM } from '../llm/llmRouter.js';
import { CONSOLIDATOR_SYSTEM_PROMPT, buildConsolidatorUserMessage } from '../prompts/consolidatorPrompt.js';
import { optimizeRawFindings } from '../utils/dataOptimizer.js';

/**
 * Node 2.5: Knowledge Consolidator
 *
 * Takes raw findings from the Research Collector and merges them
 * into a single structured JSON object.
 */
export async function consolidatorNode(state) {
  const { companyName, rawFindings, onProgress } = state;

  onProgress?.('consolidator', `Knowledge Consolidator is merging ${rawFindings?.length || 0} raw findings into a structured dataset...`);

  if (!rawFindings || rawFindings.length === 0) {
    return {
      findings: getEmptyFindingsObject(),
      errors: ['No raw findings available to consolidate.'],
    };
  }

  try {
    const optimizedFindings = optimizeRawFindings(rawFindings);
    const userMessage = buildConsolidatorUserMessage(companyName, optimizedFindings);
    
    const parsed = await callLLM({
      taskType: 'consolidator',
      systemPrompt: CONSOLIDATOR_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 2500,
      allowFallback: true // Allow fallback to Groq if HF fails (handled by router if we want)
    });

    // Ensure all top-level keys exist in case LLM missed them
    const findings = {
      ...getEmptyFindingsObject(),
      ...parsed,
    };

    onProgress?.(
      'consolidator',
      `Consolidation complete: Extracted ${findings.verifiedFacts?.length || 0} verified facts.`,
      { factCount: findings.verifiedFacts?.length || 0 }
    );

    return { findings };
  } catch (err) {
    console.error('[ConsolidatorNode] LLM synthesis error:', err.message);
    return {
      findings: getEmptyFindingsObject(),
      errors: [`LLM structured consolidation failed: ${err.message}`],
    };
  }
}

/**
 * Returns the default empty JSON structure required by downstream nodes
 */
function getEmptyFindingsObject() {
  return {
    company: {},
    business: {},
    financials: {},
    market: {},
    competitors: [],
    risks: {},
    leadership: [],
    growth: {},
    recentNews: [],
    verifiedFacts: [],
    sources: [],
    informationGaps: []
  };
}
