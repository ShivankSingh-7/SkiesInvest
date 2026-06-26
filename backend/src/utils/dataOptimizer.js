/**
 * Deterministic Data Optimizer
 *
 * Shrinks data payloads BEFORE they hit the LLM to save tokens and improve latency.
 * Implements exact-match deduplication and URL merging natively in JS.
 */

export function optimizeRawFindings(rawFindings) {
  if (!rawFindings || rawFindings.length === 0) return [];

  const uniqueStatements = new Map();

  for (const item of rawFindings) {
    if (!item.statement || typeof item.statement !== 'string') continue;

    // Normalize statement for comparison (lowercase, strip trailing punctuation and spaces)
    const normalizedKey = item.statement
      .toLowerCase()
      .replace(/[.,:;!?\s]+$/, '')
      .trim();

    if (!normalizedKey) continue;

    if (uniqueStatements.has(normalizedKey)) {
      // Merge URLs if statement already exists
      const existing = uniqueStatements.get(normalizedKey);
      if (item.sourceUrl && !existing.urls.includes(item.sourceUrl)) {
        existing.urls.push(item.sourceUrl);
      }
    } else {
      // Create new entry
      uniqueStatements.set(normalizedKey, {
        statement: item.statement, // Keep original casing
        urls: item.sourceUrl ? [item.sourceUrl] : [],
        category: item.category || 'general'
      });
    }
  }

  // Convert back to array of objects expected by consolidator prompt
  return Array.from(uniqueStatements.values()).map(v => ({
    statement: v.statement,
    sourceUrl: v.urls.join(', '),
    sourceTitle: 'Merged Facts',
    sourceType: 'optimized',
    category: v.category
  }));
}
