import { calculateFindingConfidence } from '../utils/confidenceCalculator.js';
import { getSourceQuality, getSourceDisplayName } from '../utils/sourceRanking.js';

/**
 * Node 3: Evidence Validation Agent
 *
 * Takes the structured JSON dataset from the Research Node and:
 * 1. Extracts all verifiedFacts
 * 2. Calculates confidence for each fact
 * 3. Computes overall evidence coverage based on categories populated
 */
export async function evidenceNode(state) {
  const { findings, companyName, onProgress } = state;

  onProgress?.('evidence', `Validating research knowledge base for "${companyName}"...`);

  if (!findings || Object.keys(findings).length === 0) {
    onProgress?.('evidence', 'No findings to validate — evidence coverage is 0%');
    return {
      validatedFindings: [],
      evidenceCoverage: 0,
    };
  }

  // 1. Calculate Evidence Coverage (Categories Populated / Total Categories)
  const categories = [
    'company', 'business', 'financials', 'market',
    'competitors', 'risks', 'leadership', 'growth', 'recentNews'
  ];
  
  let populatedCount = 0;
  for (const cat of categories) {
    const data = findings[cat];
    if (Array.isArray(data) && data.length > 0) {
      populatedCount++;
    } else if (typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
      // Check if the object has any actual non-empty string values
      const hasContent = Object.values(data).some(v => 
        (typeof v === 'string' && v.trim().length > 0) || 
        (Array.isArray(v) && v.length > 0)
      );
      if (hasContent) populatedCount++;
    }
  }

  const evidenceCoverage = Math.round((populatedCount / categories.length) * 100);

  // 2. Validate facts
  const rawFacts = findings.verifiedFacts || [];
  const validatedFindings = [];

  for (const f of rawFacts) {
    const rawSources = f.sourceUrls || [];
    const sources = rawSources.map(url => ({
      title: getSourceDisplayName(url),
      url: url,
      type: 'news', // simplified, could be inferred
      qualityScore: getSourceQuality(url).score,
      qualityLabel: getSourceQuality(url).label,
      displayName: getSourceDisplayName(url),
    }));

    const { confidence, sourceCount, avgQuality } = calculateFindingConfidence(sources, companyName);

    validatedFindings.push({
      statement: f.fact || String(f),
      category: 'verified_fact',
      confidence,
      sourceCount,
      avgQuality,
      sources,
      isVerified: confidence >= 50, // Slightly relaxed since sources are explicitly provided
    });
  }

  // Sort by confidence (highest first)
  validatedFindings.sort((a, b) => b.confidence - a.confidence);

  const highConfidenceCount = validatedFindings.filter((f) => f.confidence >= 70).length;

  onProgress?.(
    'evidence',
    `Validation complete: ${highConfidenceCount} high-confidence facts, ${evidenceCoverage}% category coverage (${populatedCount}/${categories.length} categories found)`,
    { total: validatedFindings.length, highConfidence: highConfidenceCount, evidenceCoverage }
  );

  return { validatedFindings, evidenceCoverage };
}
