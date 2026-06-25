import { tavily } from '@tavily/core';

let tavilyClient = null;

function getClient() {
  if (!tavilyClient) {
    tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }
  return tavilyClient;
}

/**
 * Execute a single Tavily search and return structured findings
 *
 * @param {string} query
 * @param {object} options
 * @returns {Promise<Array<{statement: string, sourceTitle: string, sourceUrl: string, sourceType: string, rawContent: string}>>}
 */
export async function searchTavily(query, options = {}) {
  const client = getClient();

  const result = await client.search(query, {
    maxResults: options.maxResults || 5,
    includeAnswer: true,
    includeRawContent: false,
    searchDepth: options.searchDepth || 'basic',
    ...options,
  });

  const findings = [];

  // Add the synthesized answer if available
  if (result.answer && result.answer.trim().length > 20) {
    const topSource = result.results?.[0];
    findings.push({
      statement: result.answer.trim(),
      sourceTitle: topSource?.title || 'Tavily AI Answer',
      sourceUrl: topSource?.url || '',
      sourceType: 'synthesized',
      query,
    });
  }

  // Add individual search results
  for (const r of result.results || []) {
    if (r.content && r.content.trim().length > 30) {
      findings.push({
        statement: r.content.substring(0, 500).trim(),
        sourceTitle: r.title || 'Untitled',
        sourceUrl: r.url || '',
        sourceType: classifySourceType(r.url),
        query,
      });
    }
  }

  return findings;
}

/**
 * Execute multiple search queries in parallel
 *
 * @param {string[]} queries
 * @returns {Promise<Array>}
 */
export async function multiSearch(queries) {
  const results = await Promise.allSettled(
    queries.map((q) => searchTavily(q))
  );

  const allFindings = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allFindings.push(...result.value);
    } else {
      console.warn('[Tavily] Search failed:', result.reason?.message);
    }
  }

  return allFindings;
}

/**
 * Classify a URL into a source type
 */
function classifySourceType(url) {
  if (!url) return 'unknown';
  if (/sec\.gov/i.test(url)) return 'sec_filing';
  if (/annual.?report|ir\./i.test(url)) return 'official';
  if (/reuters|bloomberg|ft\.com|wsj/i.test(url)) return 'financial_news';
  if (/yahoo.*finance|marketwatch|morningstar/i.test(url)) return 'financial_data';
  if (/cnbc|businessinsider|forbes/i.test(url)) return 'business_news';
  if (/techcrunch|theverge|wired/i.test(url)) return 'tech_news';
  return 'news';
}
