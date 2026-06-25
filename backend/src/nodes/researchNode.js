import { multiSearch } from '../tools/tavilyTool.js';
import { callGroqJSON } from '../llm/groq.js';
import { RESEARCH_SYSTEM_PROMPT, buildResearchUserMessage } from '../prompts/researchPrompt.js';

/**
 * Node 2: Research Agent
 *
 * Executes 8 targeted Tavily searches about the company,
 * then uses Groq to synthesize findings into structured data.
 */
export async function researchNode(state) {
  const { companyName, memoryData, onProgress } = state;

  onProgress?.('research', `Researching "${companyName}" across multiple sources...`);

  const previousFacts = memoryData?.verifiedFacts || [];

  // Build targeted search queries
  const queries = buildSearchQueries(companyName, previousFacts);

  onProgress?.('research', `Running ${queries.length} targeted searches...`, {
    queries: queries.map((q) => q.substring(0, 50)),
  });

  // Execute searches in parallel
  let rawFindings = [];
  try {
    rawFindings = await multiSearch(queries);
    onProgress?.(
      'research',
      `Retrieved ${rawFindings.length} raw results — synthesizing with AI...`
    );
  } catch (err) {
    console.error('[ResearchNode] Search error:', err.message);
    return {
      findings: [],
      errors: [`Research search failed: ${err.message}`],
    };
  }

  if (rawFindings.length === 0) {
    return {
      findings: [],
      errors: ['No search results found — Tavily returned empty results'],
    };
  }

  // Use Groq to synthesize raw results into structured findings
  try {
    const userMessage = buildResearchUserMessage(companyName, rawFindings, previousFacts);
    const parsed = await callGroqJSON(RESEARCH_SYSTEM_PROMPT, userMessage);

    const findings = (parsed.findings || []).map((f) => ({
      statement: f.statement || '',
      category: f.category || 'other',
      sourceTitle: f.sourceTitle || 'Unknown Source',
      sourceUrl: f.sourceUrl || '',
      sourceType: f.sourceType || 'news',
      query: f.query || '',
      rawSnippet: f.rawSnippet || '',
    }));

    const researchGaps = parsed.researchGaps || [];

    onProgress?.(
      'research',
      `Found ${findings.length} verified findings across ${queries.length} searches`,
      { findingCount: findings.length, gaps: researchGaps }
    );

    return { findings };
  } catch (err) {
    console.error('[ResearchNode] LLM synthesis error:', err.message);
    // Fall back to raw findings without LLM synthesis
    const fallbackFindings = rawFindings.slice(0, 15).map((f) => ({
      statement: f.statement,
      category: 'other',
      sourceTitle: f.sourceTitle,
      sourceUrl: f.sourceUrl,
      sourceType: f.sourceType,
      query: f.query,
    }));

    return {
      findings: fallbackFindings,
      errors: [`LLM synthesis failed, using raw results: ${err.message}`],
    };
  }
}

/**
 * Build targeted search queries for a company
 */
function buildSearchQueries(companyName, previousFacts) {
  const base = [
    `${companyName} company overview business model 2024 2025`,
    `${companyName} revenue financial results earnings 2024 2025`,
    `${companyName} market competitors industry position`,
    `${companyName} investment risks challenges problems`,
    `${companyName} latest news recent developments CEO`,
  ];

  // If we have previous facts, focus on what changed
  if (previousFacts.length > 0) {
    base.push(`${companyName} updates news changes since last quarter`);
  }

  return base;
}
