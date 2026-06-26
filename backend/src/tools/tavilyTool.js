import { tavily } from '@tavily/core';

let tavilyClient = null;

function getClient() {
  if (!tavilyClient) {
    tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }
  return tavilyClient;
}

/**
 * Source quality scoring — used for confidence calculation
 */
const SOURCE_QUALITY = {
  sec_filing:     95,
  official:       90,
  investor_relations: 90,
  financial_news: 80,  // Reuters, Bloomberg, FT, WSJ
  financial_data: 75,  // Yahoo Finance, Morningstar, Nasdaq
  business_news:  65,  // CNBC, Forbes, BusinessInsider
  tech_news:      60,  // TechCrunch, Wired
  news:           50,
  synthesized:    55,
  unknown:        35,
};

/**
 * Classify a URL into a source type and return quality score
 */
export function classifySource(url) {
  if (!url) return { type: 'unknown', quality: 35 };

  if (/sec\.gov/i.test(url))
    return { type: 'sec_filing', quality: SOURCE_QUALITY.sec_filing };
  if (/ir\.|investor\.?relations|annualreport/i.test(url))
    return { type: 'investor_relations', quality: SOURCE_QUALITY.investor_relations };
  if (/reuters\.com|bloomberg\.com|ft\.com|wsj\.com|financialtimes/i.test(url))
    return { type: 'financial_news', quality: SOURCE_QUALITY.financial_news };
  if (/finance\.yahoo|marketwatch|morningstar|nasdaq\.com|investing\.com/i.test(url))
    return { type: 'financial_data', quality: SOURCE_QUALITY.financial_data };
  if (/cnbc\.com|businessinsider|forbes\.com|barrons/i.test(url))
    return { type: 'business_news', quality: SOURCE_QUALITY.business_news };
  if (/techcrunch|theverge|wired\.com|venturebeat/i.test(url))
    return { type: 'tech_news', quality: SOURCE_QUALITY.tech_news };

  return { type: 'news', quality: SOURCE_QUALITY.news };
}

/**
 * Execute a single Tavily search, returning category-tagged findings.
 *
 * @param {string} query
 * @param {string} category  - investment category this query targets
 * @returns {Promise<Array>}
 */
export async function searchTavily(query, category = 'other') {
  const client = getClient();

  try {
    const result = await client.search(query, {
      maxResults: 5,
      includeAnswer: true,
      includeRawContent: false,
      searchDepth: 'basic',
    });

    const findings = [];

    // Tavily's synthesized answer — highest value, most concise
    if (result.answer && result.answer.trim().length > 30) {
      const topSource = result.results?.[0];
      const src = classifySource(topSource?.url);
      findings.push({
        statement: result.answer.trim().slice(0, 400),
        category,
        sourceTitle: topSource?.title || 'Tavily AI Answer',
        sourceUrl:   topSource?.url   || '',
        sourceType:  src.type,
        sourceQuality: src.quality,
        query,
        isSynthesized: true,
      });
    }

    // Individual web results
    for (const r of result.results || []) {
      const content = (r.content || '').trim();
      if (content.length < 40) continue;
      const src = classifySource(r.url);
      findings.push({
        statement:     content.slice(0, 350).trim(),
        category,
        sourceTitle:   r.title || 'Untitled',
        sourceUrl:     r.url   || '',
        sourceType:    src.type,
        sourceQuality: src.quality,
        query,
        isSynthesized: false,
      });
    }

    return findings;
  } catch (err) {
    console.warn(`[Tavily] Search failed for "${query}": ${err.message}`);
    return [];
  }
}

/**
 * Execute multiple category-tagged searches in parallel.
 *
 * @param {Array<{query: string, category: string}>} searchPlan
 * @returns {Promise<Array>}
 */
export async function multiSearch(searchPlan) {
  // Support both old format (string[]) and new format (object[])
  const normalized = searchPlan.map((item) =>
    typeof item === 'string'
      ? { query: item, category: 'other' }
      : item
  );

  const results = await Promise.allSettled(
    normalized.map(({ query, category }) => searchTavily(query, category))
  );

  const allFindings = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allFindings.push(...result.value);
    }
  }

  return allFindings;
}
