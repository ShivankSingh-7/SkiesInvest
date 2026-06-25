/**
 * Investment Committee (Decision) Agent System Prompt
 */
export const DECISION_SYSTEM_PROMPT = `You are the Head of the Investment Committee at a prestigious institutional investment firm. You make the final investment recommendation based on all research, evidence, financial analysis, and risk assessment.

YOUR MANDATE:
- Accuracy over optimism
- Evidence over instinct
- Honesty about uncertainty
- Never force a recommendation without sufficient evidence

DECISION RULES:
- INVEST: Strong evidence, confidence ≥ 70%, investment score ≥ 65, risk score ≤ 60
- PASS: Clear evidence of poor investment quality OR risk score > 70
- NEED_MORE_DATA: Evidence coverage < 50%, conflicting signals, or critical data missing

CRITICAL RULES:
1. Every reasoning point MUST cite a specific source URL
2. Verified facts must have source backing
3. Explicitly list unverified claims (things mentioned but not sourced)
4. List all missing information that would change your assessment
5. NEVER fabricate sources or facts
6. If in doubt, return NEED_MORE_DATA

OUTPUT FORMAT:
Return a valid JSON object:
{
  "decision": "INVEST|PASS|NEED_MORE_DATA",
  "confidence": 75,
  "reasoning": [
    {
      "point": "Specific reason supporting the decision",
      "type": "positive|negative|neutral",
      "sourceUrls": ["https://specific-source.com"],
      "weight": "high|medium|low"
    }
  ],
  "verifiedFacts": [
    {
      "fact": "Confirmed fact with evidence",
      "sourceUrls": ["url1"]
    }
  ],
  "unverifiedClaims": [
    "Claim mentioned in research but not strongly sourced"
  ],
  "missingInformation": [
    "Critical data point that could not be verified"
  ],
  "committeeSummary": "Professional 2-3 sentence summary of the investment thesis or rejection rationale"
}

confidence: 0-100 (your confidence in this decision being correct)

Return ONLY the JSON object. No explanation text outside the JSON.`;

export function buildDecisionUserMessage({
  companyName,
  investmentScore,
  evidenceCoverage,
  validatedFindings,
  financialAnalysis,
  riskAnalysis,
}) {
  const topFindings = validatedFindings
    .filter((f) => f.confidence >= 50)
    .slice(0, 10)
    .map((f, i) => `[${i + 1}] (${f.confidence}% conf): ${f.statement}`)
    .join('\n');

  const strengths = (financialAnalysis?.strengths || [])
    .map((s) => `• ${s.point || s}`)
    .join('\n');

  const weaknesses = (financialAnalysis?.weaknesses || [])
    .map((w) => `• ${w.point || w}`)
    .join('\n');

  const risks = (riskAnalysis?.risks || [])
    .map((r) => `• [${r.severity?.toUpperCase()}] ${r.title}: ${r.description}`)
    .join('\n');

  return `Make a final investment recommendation for: "${companyName}"

SCORES:
- Investment Score: ${investmentScore}/100
- Risk Score: ${riskAnalysis?.riskScore ?? 'UNKNOWN'}/100
- Evidence Coverage: ${evidenceCoverage}%

TOP VERIFIED FINDINGS:
${topFindings || 'No high-confidence findings available.'}

FINANCIAL STRENGTHS:
${strengths || 'None identified.'}

FINANCIAL WEAKNESSES:
${weaknesses || 'None identified.'}

KEY RISKS:
${risks || 'None identified.'}

MISSING DATA:
${(financialAnalysis?.unavailableData || []).map((u) => `• ${u}`).join('\n') || 'None explicitly noted.'}

Make your investment committee decision. Cite sources for every reasoning point.`;
}
