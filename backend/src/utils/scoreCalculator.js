/**
 * Investment Score Calculator
 *
 * Combines multiple dimensions into a final investment score (0-100).
 * Deterministically evaluates business metrics instead of heuristic counting.
 */

// Helper to check if a metric is unavailable
const isUnavailable = (val) => !val || String(val).toUpperCase().includes('UNAVAILABLE');

// Helper to evaluate text metrics based on keywords
function evaluateMetricText(text, positiveKeywords, negativeKeywords, defaultValue = 50) {
  if (isUnavailable(text)) return null; // Null means omit from calculation
  
  const lowerText = String(text).toLowerCase();
  
  let score = defaultValue;
  
  // Check positive signals
  const hasPositive = positiveKeywords.some(kw => lowerText.includes(kw));
  if (hasPositive) score += 30;

  // Check super positive signals (optional boost)
  const superPositives = ['strong', 'leader', 'dominant', 'significant', 'excellent', 'robust', 'accelerating', 'high'];
  if (hasPositive && superPositives.some(kw => lowerText.includes(kw))) {
    score += 15;
  }
  
  // Check negative signals
  const hasNegative = negativeKeywords.some(kw => lowerText.includes(kw));
  if (hasNegative) score -= 30;

  // Clamp 0-100
  return Math.min(100, Math.max(0, score));
}

// Calculate an average of available scores, ignoring nulls
function averageAvailableScores(scores) {
  const validScores = scores.filter(s => s !== null);
  if (validScores.length === 0) return 50; // Neutral fallback if all data missing
  const sum = validScores.reduce((a, b) => a + b, 0);
  return sum / validScores.length;
}

/**
 * Extract numeric scores from LLM structured metrics
 *
 * @param {object} financialAnalysis
 */
function extractFinancialScores(financialAnalysis) {
  const metrics = financialAnalysis?.metrics || {};

  // 1. Growth Score (revenueGrowth, businessModel)
  const revenueScore = evaluateMetricText(
    metrics.revenueGrowth, 
    ['grow', 'increase', 'up', 'accelerate', 'expand', 'positive'], 
    ['decline', 'decrease', 'drop', 'shrink', 'negative', 'slow']
  );
  
  const businessModelGrowth = evaluateMetricText(
    metrics.businessModel, 
    ['scale', 'recurring', 'subscription', 'innovative', 'expand', 'platform'], 
    ['legacy', 'outdated', 'decline', 'struggle', 'pivot']
  );

  const growthScore = averageAvailableScores([revenueScore, businessModelGrowth]);

  // 2. Market Position Score (marketPosition, competitiveAdvantage)
  const marketPosScore = evaluateMetricText(
    metrics.marketPosition, 
    ['leader', 'dominant', 'top', 'strong', 'share', 'monopoly'], 
    ['lagging', 'behind', 'weak', 'lose', 'struggle', 'niche']
  );

  const moatScore = evaluateMetricText(
    metrics.competitiveAdvantage, 
    ['moat', 'strong', 'proprietary', 'brand', 'network effect', 'scale'], 
    ['none', 'weak', 'commoditized', 'low barrier']
  );

  const marketPositionScore = averageAvailableScores([marketPosScore, moatScore]);

  // 3. Financial Health Score (profitability, fundingStatus)
  const profitScore = evaluateMetricText(
    metrics.profitability,
    ['profitable', 'margin', 'cash flow', 'positive', 'earnings', 'net income'],
    ['loss', 'burn', 'unprofitable', 'negative', 'debt']
  );

  const fundingScore = evaluateMetricText(
    metrics.fundingStatus,
    ['cash', 'strong', 'runway', 'healthy', 'capitalized', 'public'],
    ['debt', 'raise', 'need', 'distress', 'bankruptcy', 'dilution']
  );

  const financialHealthScore = averageAvailableScores([profitScore, fundingScore]);

  return { growthScore, marketPositionScore, financialHealthScore };
}

// ─── Materiality weights by risk type ────────────────────────────────
// Higher = more material to measurable financial impact
const MATERIALITY = {
  financial:   2,   // Debt default, accounting fraud — highest materiality
  regulatory:  0.8,   // Quantified fines, export bans
  operational: 0.7,   // Supply chain impact, execution failure
  competition: 0.6,   // Measurable market share loss
  market:      0.5,   // External cycle impact
  data_gap:    0.0,   // Never contributes to risk score
};

// Base contribution per severity (matches user requested ranges)
// High: ~20-30, Medium: ~8-12, Low: ~3-6
const SEVERITY_BASE = { high: 24, medium: 10, low: 4 };

/**
 * Deterministically aggregate structured risks into a Composite Risk Score.
 *
 * Philosophy: "How much MEASURABLE FINANCIAL RISK does this company have?"
 *
 * ONLY risks with hasQuantitativeImpact=true contribute to the score.
 * Risk Indicators (qualitative observations) are displayed but score zero.
 *
 * Steps:
 *   1. Start with a baseline financial risk of 25 (average healthy company).
 *   2. Filter to quantitative risks only (hasQuantitativeImpact=true).
 *   3. Group by type for theme deduplication.
 *   4. Score each risk: severityBase × materiality × diminishing returns.
 *   5. Apply company-resilience dampener from financial metrics.
 *   6. Clamp 0-100.
 *
 * @param {object} riskAnalysis — { risks: [...], riskScore, riskSummary }
 * @param {object} [financialAnalysis] — optional, used for resilience dampener
 * @returns {number} compositeRiskScore 0-100
 */
function calculateDeterministicRiskScore(riskAnalysis, financialAnalysis) {
  // 1. Extremely low baseline for companies without financial issues
  const BASELINE_RISK = 10;
  let addedFinancialRisk = 0;
  
  const metrics = financialAnalysis?.metrics || {};
  
  // 2. Severe penalty for unprofitable operations
  const pr = String(metrics.profitability || '').toLowerCase();
  if (['loss', 'burn', 'unprofitable', 'negative', 'deficit'].some(kw => pr.includes(kw))) {
    addedFinancialRisk += 40; // Severe increase
  }
  
  // 3. Severe penalty for heavy debt or funding distress
  const fs = String(metrics.fundingStatus || '').toLowerCase();
  if (['debt', 'distress', 'bankruptcy', 'dilution', 'insolvent', 'leverage'].some(kw => fs.includes(kw))) {
    addedFinancialRisk += 50; // Massively penalize high debt
  }

  // 3.5. Heavy penalty for operational challenges
  const weaknesses = financialAnalysis?.weaknesses || [];
  const hasOpChallenge = weaknesses.some(w => {
    const text = String(w).toLowerCase();
    return ['operation', 'supply chain', 'execution', 'production', 'manufacturing', 'logistics', 'capacity'].some(kw => text.includes(kw));
  });

  if (hasOpChallenge) {
    addedFinancialRisk += 30; // Severe operational penalty
  }

  // 4. Score the extracted LLM risks, but severely limit their impact
  const risks = riskAnalysis?.risks || [];
  
  // Catch-all: Sometimes the LLM puts massive debt facts purely into the risk array and misses the financial metrics
  const allRiskText = JSON.stringify(risks).toLowerCase();
  if (addedFinancialRisk === 0 && ['debt of', 'huge debt', 'massive debt', 'loss of', 'net loss', 'declining revenue'].some(kw => allRiskText.includes(kw))) {
    addedFinancialRisk += 40;
  }
  
  // Apply strict filters to quantitative risks
  const quantitativeRisks = risks.filter(r => {
    if (r.type === 'data_gap' || r.hasQuantitativeImpact !== true) return false;
    
    const text = (r.title + ' ' + r.description).toLowerCase();
    const isValuationRisk = ['valuation', 'overvalued', 'expensive', 'multiple', 'premium'].some(kw => text.includes(kw));
    
    // "very high evalution company will be considered only when it is making a huge loss otherwise it should be considered to be 0"
    if (isValuationRisk && addedFinancialRisk === 0) { 
       r.hasQuantitativeImpact = false; // Convert to indicator basically
       return false;
    }
    
    // "remove may be or any assumption from the risk calculation and have null"
    if (['may ', 'might ', 'could ', 'potential ', 'expected ', 'assumption'].some(kw => text.includes(kw))) {
       // Only nullify if it doesn't contain hard financial numbers about debt/losses
       if (!['debt', 'loss', 'billion', 'million', 'revenue'].some(kw => text.includes(kw))) {
         r.hasQuantitativeImpact = false; // Nullify assumption
         return false;
       }
    }
    
    return true;
  });
  
  let llmAddedRisk = 0;
  for (const risk of quantitativeRisks) {
    const severity = String(risk.severity).toLowerCase();
    // Vastly reduced impact: High=10, Medium=4, Low=1
    const base = severity === 'high' ? 10 : severity === 'medium' ? 4 : 1; 
    llmAddedRisk += base;
  }
  
  // Cap the LLM-derived risk so it can't dominate the score (max +20)
  llmAddedRisk = Math.min(20, llmAddedRisk);

  // 5. Company resilience dampener
  // Strong fundamentals naturally absorb isolated risks.
  let resilienceSignals = 0;
  let resilienceCount = 0;

  // Check market position strength
  const mp = String(metrics.marketPosition || '').toLowerCase();
  if (!isUnavailable(metrics.marketPosition)) {
    resilienceCount++;
    if (['leader', 'dominant', 'top', 'strong'].some(kw => mp.includes(kw))) resilienceSignals++;
  }

  // Check profitability
  if (!isUnavailable(metrics.profitability)) {
    resilienceCount++;
    if (['profitable', 'margin', 'positive', 'earnings', 'cash flow'].some(kw => pr.includes(kw))) resilienceSignals++;
  }

  // Check funding / financial strength
  if (!isUnavailable(metrics.fundingStatus)) {
    resilienceCount++;
    if (['cash', 'strong', 'healthy', 'capitalized', 'public'].some(kw => fs.includes(kw))) resilienceSignals++;
  }

  let resilienceFactor = 1.0;
  if (resilienceCount > 0) {
    const resilienceRatio = resilienceSignals / resilienceCount; // 0 to 1
    resilienceFactor = 1.0 - (resilienceRatio * 0.4); 
  }

  // CRITICAL: A company with massive debt or operational distress CANNOT use resilience to hide its risk
  if (addedFinancialRisk >= 30) {
    resilienceFactor = 1.0;
  }

  // 6. Final Calculation
  const rawTotal = BASELINE_RISK + addedFinancialRisk + llmAddedRisk;
  const compositeScore = Math.round(Math.min(100, Math.max(0, rawTotal * resilienceFactor)));
  
  return compositeScore;
}

/**
 * Calculate the final investment score
 *
 * @param {object} params
 * @returns {{ investmentScore: number, breakdown: object }}
 */
export function calculateInvestmentScore({
  companyName,
  financialAnalysis,
  riskAnalysis,
  evidenceCoverage,
  validatedFindings,
}) {
  // Deterministic calculations
  const { growthScore, marketPositionScore, financialHealthScore } = extractFinancialScores(financialAnalysis);
  const deterministicRiskScore = calculateDeterministicRiskScore(riskAnalysis, financialAnalysis);

  // Weighted formula:
  // Growth: 25%, Market Position: 25%, Financial Health: 25%, Risk Adjustment: 25%
  const riskAdjustedScore = 100 - deterministicRiskScore;
  
  let rawScore = 
    (growthScore * 0.25) + 
    (marketPositionScore * 0.25) + 
    (financialHealthScore * 0.25) + 
    (riskAdjustedScore * 0.25);

  // Reputation Boost: Blue chip companies inherently carry less investment risk
  const blueChips = ['microsoft', 'apple', 'nvidia', 'alphabet', 'google', 'amazon', 'meta', 'berkshire', 'tesla', 'broadcom', 'lilly', 'tsmc'];
  const isBlueChip = blueChips.some(bc => String(companyName).toLowerCase().includes(bc));
  
  if (isBlueChip) {
    rawScore += 5; // Slight premium for massive reputation
  }

  const investmentScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  const breakdown = {
    growthScore: Math.round(growthScore),
    marketPositionScore: Math.round(marketPositionScore),
    financialHealthScore: Math.round(financialHealthScore),
    riskAdjustedScore: Math.round(riskAdjustedScore),
    deterministicRiskScore: Math.round(deterministicRiskScore),
    weights: { growth: 0.25, market: 0.25, financials: 0.25, risk: 0.25 },
  };

  return { investmentScore, breakdown };
}

/**
 * Determine investment decision thresholds
 *
 * @returns {'INVEST' | 'WATCH' | 'PASS' | 'INCONCLUSIVE' | 'Don't Invest}
 */
export function determineDecisionThreshold(
  investmentScore,
  confidence,
  evidenceCoverage,
  riskScore
) {
  // Insufficient data to make a reliable call

  if(confidence>60 && investmentScore<=40){
    return 'Don\'t Invest'
  }
  if (confidence < 40) {
    return 'INCONCLUSIVE';
  }

  // Severe risk instantly invalidates investment
  if (riskScore >= 75) {
    return 'PASS';
  }

  // Strong fundamentals + high confidence
  if (investmentScore >= 65 && confidence >= 60) {
    return 'INVEST';
  }

  // Borderline / decent fundamentals but need to monitor
  if (investmentScore >= 50) {
    return 'WATCH';
  }

  // Weak fundamentals
  return 'PASS';
}
