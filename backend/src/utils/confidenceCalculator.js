import { getSourceQuality } from './sourceRanking.js';

/**
 * Confidence Calculator
 *
 * Computes a confidence score (0-100) for a finding based on:
 * 1. Number of supporting sources
 * 2. Quality/reliability of those sources
 */

/**
 * Calculate confidence for a single finding
 *
 * @param {Array<{url: string, title: string}>} sources
 * @returns {{ confidence: number, sourceCount: number, avgQuality: number }}
 */
export function calculateFindingConfidence(sources) {
  if (!sources || sources.length === 0) {
    return { confidence: 0, sourceCount: 0, avgQuality: 0 };
  }

  const sourceCount = sources.length;
  const qualityScores = sources.map((s) => getSourceQuality(s.url).score);
  const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;

  // Base confidence from source count
  let baseConfidence;
  if (sourceCount >= 5) {
    baseConfidence = 90;
  } else if (sourceCount >= 3) {
    baseConfidence = 75;
  } else if (sourceCount === 2) {
    baseConfidence = 60;
  } else {
    baseConfidence = 35;
  }

  // Quality multiplier — high quality sources boost confidence
  // avgQuality 80-100 → multiplier 1.05
  // avgQuality 60-79  → multiplier 1.00
  // avgQuality 40-59  → multiplier 0.90
  // avgQuality 20-39  → multiplier 0.75
  let qualityMultiplier;
  if (avgQuality >= 80) qualityMultiplier = 1.05;
  else if (avgQuality >= 60) qualityMultiplier = 1.00;
  else if (avgQuality >= 40) qualityMultiplier = 0.90;
  else qualityMultiplier = 0.75;

  const confidence = Math.min(99, Math.round(baseConfidence * qualityMultiplier));

  return { confidence, sourceCount, avgQuality: Math.round(avgQuality) };
}

/**
 * Calculate overall evidence coverage score (0-100)
 * Based on how many topic areas have been covered with high confidence
 *
 * @param {Array<{confidence: number}>} validatedFindings
 * @returns {number}
 */
export function calculateEvidenceCoverage(validatedFindings) {
  if (!validatedFindings || validatedFindings.length === 0) return 0;

  const highConfidence = validatedFindings.filter((f) => f.confidence >= 70).length;
  const total = validatedFindings.length;

  if (total === 0) return 0;

  const coverageRatio = highConfidence / total;
  const avgConfidence =
    validatedFindings.reduce((sum, f) => sum + f.confidence, 0) / total;

  // Weight: 60% from coverage ratio, 40% from average confidence
  const coverage = Math.round(coverageRatio * 0.6 * 100 + avgConfidence * 0.4);
  return Math.min(100, coverage);
}

/**
 * Determine if evidence is sufficient for an investment decision
 *
 * @param {number} evidenceCoverage
 * @param {Array} validatedFindings
 * @returns {{ sufficient: boolean, reason: string }}
 */
export function isEvidenceSufficient(evidenceCoverage, validatedFindings) {
  const highQualityFindings = (validatedFindings || []).filter(
    (f) => f.confidence >= 50
  );

  // Only flag as insufficient if we have almost nothing to go on
  if (highQualityFindings.length < 2) {
    return {
      sufficient: false,
      reason: 'Insufficient evidence to make a reliable recommendation',
    };
  }

  // Missing financial metrics (debt, cash flow etc.) should NOT be treated as
  // insufficient evidence — they are information gaps, not evidence failure.
  return { sufficient: true, reason: 'Evidence coverage meets minimum threshold' };
}
