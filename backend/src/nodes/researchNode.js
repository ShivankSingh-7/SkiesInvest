import { multiSearch } from '../tools/tavilyTool.js';
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
      rawFindings: [],
      errors: [`Research search failed: ${err.message}`],
    };
  }

  if (rawFindings.length === 0) {
    return {
      rawFindings: [],
      errors: ['No search results found — Tavily returned empty results'],
    };
  }

  // 3. Filter and deduplicate findings to avoid extreme TPM bloat
  const filteredFindings = filterFindingsForTokenLimit(rawFindings, 20); // Keep top 20 snippets max

  onProgress?.('research', `Research collection complete: Retained ${filteredFindings.length} high-quality sources. Passing to Knowledge Consolidator...`);

  return { rawFindings: filteredFindings };
}

/**
 * Builds 8 specific targeted queries for the research phase to save API limits.
 */
function buildComprehensiveSearchPlan(companyName) {
  return [
    { query: `${companyName} business overview`, category: 'business' },
    { query: `${companyName} earnings investor relations`, category: 'financials' },
    { query: `${companyName} Reuters news`, category: 'news' },
    { query: `${companyName} major competitors`, category: 'competitors' },
    { query: `${companyName} market share`, category: 'market' },
    { query: `${companyName} main risks`, category: 'risks' },
    { query: `${companyName} AI strategy growth`, category: 'growth' },
    { query: `${companyName} recent financial performance`, category: 'financials' },
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


