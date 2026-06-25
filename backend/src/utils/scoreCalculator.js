/**
 * Investment Score Calculator
 *
 * Combines multiple dimensions into a final investment score (0-100).
 *
 * Formula:
 *   investmentScore = (
 *     growthScore        * 0.30 +
 *     marketPositionScore * 0.25 +
 *     (100 - riskScore)  * 0.25 +
 *     evidenceQuality    * 0.20
 *   )
 *
 * Poor evidence quality forces the score down regardless of other dimensions.
 */

/**
 * Extract a numeric score from LLM financial analysis
 *
 * @param {object} financialAnalysis
 * @returns {{ growthScore: number, marketPositionScore: number }}
 */
function extractFinancialScores(financialAnalysis) {
  const strengths = financialAnalysis?.strengths?.length || 0;
  const weaknesses = financialAnalysis?.weaknesses?.length || 0;
  const unavailable = financialAnalysis?.unavailableData?.length || 0;

  // Growth score: higher strengths, fewer weaknesses, less unavailable data
  const totalSignals = strengths + weaknesses + unavailable;
  const strengthRatio = totalSignals > 0 ? strengths / totalSignals : 0.5;
  const growthScore = Math.round(strengthRatio * 80 + 10); // 10-90 range

  // Market position score inferred from explicit metrics if available
  const metrics = financialAnalysis?.metrics || {};
  const hasMarketData =
    metrics.marketPosition || metrics.competitiveAdvantage || metrics.marketShare;

  const marketPositionScore = hasMarketData
    ? Math.min(85, growthScore + 5)
    : Math.max(20, growthScore - 10);

  return { growthScore, marketPositionScore };
}

/**
 * Calculate the final investment score
 *
 * @param {object} params
 * @param {object} params.financialAnalysis - Financial analysis result
 * @param {object} params.riskAnalysis - { riskScore: number }
 * @param {number} params.evidenceCoverage - 0-100
 * @param {Array}  params.validatedFindings - Array of validated findings
 * @returns {{ investmentScore: number, breakdown: object }}
 */
export function calculateInvestmentScore({
  financialAnalysis,
  riskAnalysis,
  evidenceCoverage,
  validatedFindings,
}) {
  const riskScore = riskAnalysis?.riskScore ?? 50;
  const { growthScore, marketPositionScore } =
    extractFinancialScores(financialAnalysis);

  // Evidence quality score (directly from coverage)
  const evidenceQualityScore = evidenceCoverage;

  // Raw weighted score
  const rawScore =
    growthScore * 0.30 +
    marketPositionScore * 0.25 +
    (100 - riskScore) * 0.25 +
    evidenceQualityScore * 0.20;

  // Evidence penalty: if coverage is very low, cap the score
  let finalScore = rawScore;
  if (evidenceCoverage < 30) {
    finalScore = Math.min(rawScore, 35);
  } else if (evidenceCoverage < 50) {
    finalScore = Math.min(rawScore, 55);
  }

  const investmentScore = Math.round(Math.min(100, Math.max(0, finalScore)));

  const breakdown = {
    growthScore: Math.round(growthScore),
    marketPositionScore: Math.round(marketPositionScore),
    riskAdjustedScore: Math.round(100 - riskScore),
    evidenceQualityScore: Math.round(evidenceQualityScore),
    weights: { growth: 0.30, market: 0.25, risk: 0.25, evidence: 0.20 },
  };

  return { investmentScore, breakdown };
}

/**
 * Determine investment decision thresholds
 *
 * @param {number} investmentScore
 * @param {number} confidence
 * @param {number} evidenceCoverage
 * @param {number} riskScore
 * @returns {'INVEST' | 'PASS' | 'NEED_MORE_DATA'}
 */
export function determineDecisionThreshold(
  investmentScore,
  confidence,
  evidenceCoverage,
  riskScore
) {
  // Force NEED_MORE_DATA if evidence is too thin
  if (evidenceCoverage < 40 || confidence < 45) {
    return 'NEED_MORE_DATA';
  }

  // Force PASS if risk is very high
  if (riskScore >= 75) {
    return 'PASS';
  }

  // INVEST requires high score AND adequate confidence
  if (investmentScore >= 65 && confidence >= 65) {
    return 'INVEST';
  }

  // PASS for clearly weak opportunities
  if (investmentScore < 40 || riskScore >= 60) {
    return 'PASS';
  }

  // Borderline cases → need more data
  return 'NEED_MORE_DATA';
}
