/**
 * Investment Score Calculator
 *
 * Combines multiple dimensions into a final investment score (0-100).
 *
 * Formula:
 *   investmentScore = (
 *     growthScore         * 0.35 +
 *     marketPositionScore * 0.25 +
 *     (100 - riskScore)   * 0.30 +
 *     evidenceBonus       * 0.10
 *   )
 *
 * KEY RULE: "DATA UNAVAILABLE" items are information gaps — they are NOT
 * negative signals and must NOT reduce the growth or market scores.
 */

/**
 * Extract a numeric score from LLM financial analysis
 *
 * @param {object} financialAnalysis
 * @returns {{ growthScore: number, marketPositionScore: number }}
 */
function extractFinancialScores(financialAnalysis) {
  const strengths  = financialAnalysis?.strengths?.length  || 0;
  const weaknesses = financialAnalysis?.weaknesses?.length || 0;

  // IMPORTANT: Do NOT include unavailableData in the denominator.
  // Missing metrics are information gaps, not evidence of weakness.
  const totalSignals = strengths + weaknesses;

  let strengthRatio;
  if (totalSignals === 0) {
    // No signals at all — neutral, don't punish
    strengthRatio = 0.5;
  } else {
    strengthRatio = strengths / totalSignals;
  }

  // Growth score: 20-90 range.
  // A pure 0.5 ratio (equal strengths & weaknesses) maps to ~55.
  const growthScore = Math.round(strengthRatio * 70 + 20);

  // Market position score — look for explicit market metric in LLM output
  const metrics = financialAnalysis?.metrics || {};
  const hasMarketData =
    metrics.marketPosition && !metrics.marketPosition.includes('UNAVAILABLE') ||
    metrics.competitiveAdvantage && !metrics.competitiveAdvantage.includes('UNAVAILABLE');

  const marketPositionScore = hasMarketData
    ? Math.min(90, growthScore + 8)   // bump up if we have real market data
    : Math.max(30, growthScore - 5);  // small neutral discount for missing data, not a punishment

  return { growthScore, marketPositionScore };
}

/**
 * Calculate the final investment score
 *
 * @param {object} params
 * @returns {{ investmentScore: number, breakdown: object }}
 */
export function calculateInvestmentScore({
  financialAnalysis,
  riskAnalysis,
  evidenceCoverage,
  validatedFindings,
}) {
  const riskScore = riskAnalysis?.riskScore ?? 50;
  const { growthScore, marketPositionScore } = extractFinancialScores(financialAnalysis);

  // Evidence bonus: reward for having more verified findings (small weight)
  // Does NOT punish for missing coverage — coverage just stops adding bonus at high levels
  const evidenceBonus = Math.min(100, evidenceCoverage);

  // Weighted formula
  const rawScore =
    growthScore         * 0.35 +
    marketPositionScore * 0.25 +
    (100 - riskScore)   * 0.30 +
    evidenceBonus       * 0.10;

  // Soft floor: even with almost no evidence, a company with no risks gets a neutral score
  // Only hard-cap if we genuinely have near-zero findings (not just missing financial fields)
  const highConfidenceCount = (validatedFindings || []).filter((f) => f.confidence >= 50).length;

  let finalScore = rawScore;
  if (highConfidenceCount < 2) {
    // Truly insufficient research — cap at 40
    finalScore = Math.min(rawScore, 40);
  }

  const investmentScore = Math.round(Math.min(100, Math.max(0, finalScore)));

  const breakdown = {
    growthScore: Math.round(growthScore),
    marketPositionScore: Math.round(marketPositionScore),
    riskAdjustedScore: Math.round(100 - riskScore),
    evidenceBonus: Math.round(evidenceBonus),
    weights: { growth: 0.35, market: 0.25, risk: 0.30, evidence: 0.10 },
  };

  return { investmentScore, breakdown };
}

/**
 * Determine investment decision thresholds
 *
 * @returns {'INVEST' | 'PASS' | 'NEED_MORE_DATA'}
 */
export function determineDecisionThreshold(
  investmentScore,
  confidence,
  evidenceCoverage,
  riskScore
) {
  // Only force NEED_MORE_DATA if evidence is truly absent
  const highConfidenceMissing = confidence < 30;
  if (highConfidenceMissing) {
    return 'NEED_MORE_DATA';
  }

  // Force PASS if risk is very high
  if (riskScore >= 75) {
    return 'PASS';
  }

  // INVEST
  if (investmentScore >= 60 && confidence >= 60) {
    return 'INVEST';
  }

  // PASS for clearly weak opportunities
  if (investmentScore < 35 || riskScore >= 65) {
    return 'PASS';
  }

  // Borderline cases
  return 'NEED_MORE_DATA';
}
