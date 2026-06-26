/**
 * Risk Analysis Agent System Prompt
 */
export const RISK_SYSTEM_PROMPT = `You are a risk analyst at a top-tier investment firm. Identify and assess investment risks based only on the evidence provided.

RULES:
1. Only report risks supported by the provided findings — do NOT invent risks
2. Every risk must cite at least one source URL
3. Rate severity honestly
4. Separately flag data gaps as informational notes (not as major risks unless critical)

RISK CATEGORIES: competition, regulatory, financial, operational, market, data_gap

SEVERITY: high (impairs value) | medium (monitor) | low (manageable)

OUTPUT — return ONLY this JSON:
{
  "risks": [
    {
      "type": "competition|regulatory|financial|operational|market|data_gap",
      "title": "Short title",
      "description": "Evidence-backed description (2 sentences max)",
      "severity": "high|medium|low",
      "sourceUrls": ["url1"],
      "mitigatingFactors": "Brief mitigation or null"
    }
  ],
  "riskScore": 45,
  "riskSummary": "One sentence risk overview."
}

riskScore: 0 = very low risk, 100 = extremely high risk. Return ONLY the JSON.`;

export function buildRiskUserMessage(companyName, validatedFindings, financialAnalysis) {
  // Use top 12 high-confidence findings only — keeps payload under 6000 TPM
  const topFindings = validatedFindings
    .filter((f) => f.confidence >= 40)
    .slice(0, 12);

  const findingText = topFindings
    .map((f, i) => {
      // Truncate long statements to 120 chars and use only the first source URL
      const stmt = f.statement.length > 120 ? f.statement.slice(0, 120) + '...' : f.statement;
      const src = (f.sources || [])[0]?.url || '';
      return `[${i + 1}] ${f.confidence}%: ${stmt}${src ? ' — ' + src : ''}`;
    })
    .join('\n');

  // Only pass real weakness points (not "DATA UNAVAILABLE" entries)
  const weaknesses = (financialAnalysis?.weaknesses || [])
    .filter((w) => {
      const text = (w.point || w || '').toLowerCase();
      return !text.includes('data unavailable') && !text.includes('not available');
    })
    .slice(0, 4)
    .map((w) => `- ${(w.point || w).slice(0, 80)}`)
    .join('\n');

  // List missing data as a simple note — not part of the risk evidence
  const missingNote = (financialAnalysis?.unavailableData || [])
    .slice(0, 4)
    .join(', ');

  return `Assess risks for: "${companyName}"

FINDINGS (top ${topFindings.length}, ranked by confidence):
${findingText || 'No findings available.'}

WEAKNESSES FROM FINANCIAL ANALYSIS:
${weaknesses || 'None identified.'}${missingNote ? `\n\nDATA GAPS (informational only, not evidence of risk): ${missingNote}` : ''}

Identify material risks based ONLY on the evidence. Calculate riskScore 0-100.`;
}
