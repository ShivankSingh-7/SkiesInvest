import { multiSearch } from '../tools/tavilyTool.js';
import { callGroqJSON } from '../llm/groq.js';
import { RESEARCH_SYSTEM_PROMPT, buildResearchUserMessage } from '../prompts/researchPrompt.js';

/**
 * Node 2: Research Agent Redesigned
 *
 * Executes 16 targeted Tavily searches across multiple categories.
 * Filters results to respect LLM token limits, then uses Groq to
 * build a massive structured knowledge base JSON object.
 */
export async function researchNode(state) {
  const { companyName, onProgress } = state;

  onProgress?.('research', `Initiating comprehensive structured research on "${companyName}"...`);

  // 1. Define the 16 massive search queries based on the new strategy
  const searchPlan = buildComprehensiveSearchPlan(companyName);

  onProgress?.('research', `Running ${searchPlan.length} targeted parallel searches...`, {
    categories: [...new Set(searchPlan.map(s => s.category))],
  });

  // 2. Execute searches in parallel
  let rawFindings = [];
  try {
    rawFindings = await multiSearch(searchPlan);
    onProgress?.('research', `Retrieved ${rawFindings.length} raw results across all categories.`);
  } catch (err) {
    console.error('[ResearchNode] Search error:', err.message);
    return {
      findings: getEmptyFindingsObject(),
      errors: [`Research search failed: ${err.message}`],
    };
  }

  if (rawFindings.length === 0) {
    return {
      findings: getEmptyFindingsObject(),
      errors: ['No search results found — Tavily returned empty results'],
    };
  }

  // 3. Filter and deduplicate findings to avoid Groq 6000 TPM limit
  // We prioritize synthesized answers and high-quality sources (SEC, IR, Reuters, Bloomberg)
  const filteredFindings = filterFindingsForTokenLimit(rawFindings, 20); // Keep top 20 snippets max

  onProgress?.('research', `Synthesizing ${filteredFindings.length} high-quality snippets into structured dataset...`);

  // 4. Use Groq to build the structured dataset
  try {
    const userMessage = buildResearchUserMessage(companyName, filteredFindings);
    const parsed = await callGroqJSON(RESEARCH_SYSTEM_PROMPT, userMessage);

    // Ensure all top-level keys exist in case LLM missed them
    const findings = {
      ...getEmptyFindingsObject(),
      ...parsed,
    };

    onProgress?.(
      'research',
      `Research complete: Extracted ${findings.verifiedFacts?.length || 0} verified facts.`,
      { factCount: findings.verifiedFacts?.length || 0 }
    );

    return { findings };
  } catch (err) {
    console.error('[ResearchNode] LLM synthesis error:', err.message);
    return {
      findings: getEmptyFindingsObject(),
      errors: [`LLM structured synthesis failed: ${err.message}`],
    };
  }
}

/**
 * Builds the 16 specific targeted queries for the research phase
 */
function buildComprehensiveSearchPlan(companyName) {
  return [
    { query: `${companyName} business overview`, category: 'business' },
    { query: `${companyName} investor relations`, category: 'financials' },
    { query: `${companyName} annual report`, category: 'financials' },
    { query: `${companyName} earnings`, category: 'financials' },
    { query: `${companyName} Reuters`, category: 'news' },
    { query: `${companyName} SEC filing`, category: 'financials' },
    { query: `${companyName} competition`, category: 'competitors' },
    { query: `${companyName} products`, category: 'business' },
    { query: `${companyName} market share`, category: 'market' },
    { query: `${companyName} financial performance`, category: 'financials' },
    { query: `${companyName} risks`, category: 'risks' },
    { query: `${companyName} acquisitions`, category: 'growth' },
    { query: `${companyName} partnerships`, category: 'growth' },
    { query: `${companyName} AI strategy`, category: 'growth' },
    { query: `${companyName} growth`, category: 'growth' },
    { query: `${companyName} valuation`, category: 'market' },
  ];
}

/**
 * Filters the raw Tavily results to stay under LLM context/TPM limits.
 * Prioritizes synthesized answers and official/financial sources.
 */
function filterFindingsForTokenLimit(findings, maxItems) {
  // Sort findings by quality:
  // 1. Synthesized answers get a big boost
  // 2. High sourceQuality (SEC=95, IR=90, Reuters=80, etc.)
  // 3. Length (longer is usually better context up to a point)
  const scored = findings.map(f => {
    let score = f.sourceQuality || 50;
    if (f.isSynthesized) score += 30; // Boost Tavily answers
    if (f.statement.length > 150) score += 10;
    
    // TRUNCATE statement to save tokens! (250 chars max)
    const shortStatement = f.statement.length > 250 
      ? f.statement.substring(0, 250) + '...'
      : f.statement;
      
    return { ...f, statement: shortStatement, sortScore: score };
  });

  scored.sort((a, b) => b.sortScore - a.sortScore);

  // Deduplicate by URL and exact statement
  const seenUrls = new Set();
  const seenStatements = new Set();
  const unique = [];

  for (const f of scored) {
    if (unique.length >= maxItems) break;

    // We allow synthesized answers even if URL is missing/duplicate since they aggregate
    if (!f.isSynthesized) {
      if (f.sourceUrl && seenUrls.has(f.sourceUrl)) continue;
      if (f.sourceUrl) seenUrls.add(f.sourceUrl);
    }

    const snippetPrefix = f.statement.substring(0, 50).toLowerCase();
    if (seenStatements.has(snippetPrefix)) continue;
    seenStatements.add(snippetPrefix);

    unique.push(f);
  }

  return unique;
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
