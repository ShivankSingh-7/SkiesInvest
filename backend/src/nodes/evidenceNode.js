import { calculateFindingConfidence, calculateEvidenceCoverage } from '../utils/confidenceCalculator.js';
import { getSourceQuality, getSourceDisplayName } from '../utils/sourceRanking.js';

/**
 * Node 3: Evidence Validation Agent
 *
 * Takes raw research findings and:
 * 1. Groups findings by topic to aggregate sources
 * 2. Calculates confidence for each finding
 * 3. Ranks sources by quality
 * 4. Computes overall evidence coverage
 */
export async function evidenceNode(state) {
  const { findings, companyName, onProgress } = state;

  onProgress?.('evidence', `Validating ${findings.length} research findings...`);

  if (!findings || findings.length === 0) {
    onProgress?.('evidence', 'No findings to validate — evidence coverage is 0%');
    return {
      validatedFindings: [],
      evidenceCoverage: 0,
    };
  }

  // Group findings by topic similarity to aggregate sources
  const grouped = groupFindingsByCategory(findings);

  // Validate each group
  const validatedFindings = [];

  for (const [category, categoryFindings] of Object.entries(grouped)) {
    for (const finding of categoryFindings) {
      // Build source list for this finding
      const sources = [];

      // Add the primary source
      if (finding.sourceUrl) {
        const quality = getSourceQuality(finding.sourceUrl);
        sources.push({
          title: finding.sourceTitle || getSourceDisplayName(finding.sourceUrl),
          url: finding.sourceUrl,
          type: finding.sourceType || 'news',
          qualityScore: quality.score,
          qualityLabel: quality.label,
          displayName: getSourceDisplayName(finding.sourceUrl),
        });
      }

      // Look for other findings with the same category for source aggregation
      const relatedSources = categoryFindings
        .filter(
          (f) =>
            f !== finding &&
            f.sourceUrl &&
            f.sourceUrl !== finding.sourceUrl &&
            areSimilarStatements(f.statement, finding.statement)
        )
        .slice(0, 3)
        .map((f) => {
          const quality = getSourceQuality(f.sourceUrl);
          return {
            title: f.sourceTitle || getSourceDisplayName(f.sourceUrl),
            url: f.sourceUrl,
            type: f.sourceType || 'news',
            qualityScore: quality.score,
            qualityLabel: quality.label,
            displayName: getSourceDisplayName(f.sourceUrl),
          };
        });

      // Deduplicate sources
      const allSources = deduplicateSources([...sources, ...relatedSources]);

      // Calculate confidence
      const { confidence, sourceCount, avgQuality } =
        calculateFindingConfidence(allSources);

      validatedFindings.push({
        statement: finding.statement,
        category: finding.category || category,
        confidence,
        sourceCount,
        avgQuality,
        sources: allSources,
        isVerified: confidence >= 60 && sourceCount >= 2,
      });
    }
  }

  // Sort by confidence (highest first)
  validatedFindings.sort((a, b) => b.confidence - a.confidence);

  // Limit to top 20 findings to prevent exceeding downstream LLM token limits (like 6000 TPM)
  const limitedFindings = validatedFindings.slice(0, 20);

  // Calculate overall evidence coverage based on the limited highly-relevant findings
  const evidenceCoverage = calculateEvidenceCoverage(limitedFindings);

  const highConfidenceCount = limitedFindings.filter((f) => f.confidence >= 70).length;

  onProgress?.(
    'evidence',
    `Evidence validated: ${highConfidenceCount} high-confidence findings (limited to top 20), ${evidenceCoverage}% coverage`,
    { total: limitedFindings.length, highConfidence: highConfidenceCount, evidenceCoverage }
  );

  return { validatedFindings: limitedFindings, evidenceCoverage };
}

/**
 * Group findings by category
 */
function groupFindingsByCategory(findings) {
  const groups = {};
  for (const finding of findings) {
    const cat = finding.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(finding);
  }
  return groups;
}

/**
 * Check if two statements are similar enough to share sources
 * Simple keyword overlap check
 */
function areSimilarStatements(a, b) {
  if (!a || !b) return false;
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 4));
  const wordsB = b.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  const overlap = wordsB.filter((w) => wordsA.has(w)).length;
  return overlap >= 2;
}

/**
 * Remove duplicate sources by URL
 */
function deduplicateSources(sources) {
  const seen = new Set();
  return sources.filter((s) => {
    if (!s.url || seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}
