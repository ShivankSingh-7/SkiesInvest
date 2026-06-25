import { callGroqJSON } from '../llm/groq.js';
import { RISK_SYSTEM_PROMPT, buildRiskUserMessage } from '../prompts/riskPrompt.js';

/**
 * Node 5: Risk Analysis Agent
 *
 * Identifies and scores all material risks for the investment.
 * Only reports risks supported by evidence.
 */
export async function riskNode(state) {
  const { companyName, validatedFindings, financialAnalysis, onProgress } = state;

  onProgress?.('risk', 'Analyzing investment risks...');

  // Default to moderate-high risk if no evidence
  if (!validatedFindings || validatedFindings.length === 0) {
    return {
      riskAnalysis: {
        risks: [
          {
            type: 'data_risk',
            title: 'Insufficient Research Data',
            description:
              'Unable to assess investment risks due to insufficient research findings.',
            severity: 'high',
            sourceUrls: [],
            mitigatingFactors: null,
          },
        ],
        riskScore: 70,
        riskSummary:
          'Risk assessment could not be completed due to insufficient research data.',
      },
    };
  }

  try {
    const userMessage = buildRiskUserMessage(
      companyName,
      validatedFindings,
      financialAnalysis
    );
    const parsed = await callGroqJSON(RISK_SYSTEM_PROMPT, userMessage);

    // Normalize risk objects
    const risks = (parsed.risks || []).map((risk) => ({
      type: risk.type || 'market',
      title: risk.title || 'Unnamed Risk',
      description: risk.description || '',
      severity: risk.severity || 'medium',
      sourceUrls: risk.sourceUrls || [],
      mitigatingFactors: risk.mitigatingFactors || null,
    }));

    // Validate risk score is in range
    const riskScore = Math.min(100, Math.max(0, parseInt(parsed.riskScore, 10) || 50));

    onProgress?.(
      'risk',
      `Risk analysis complete: ${risks.length} risks identified, risk score ${riskScore}/100`,
      { riskCount: risks.length, riskScore }
    );

    return {
      riskAnalysis: {
        risks,
        riskScore,
        riskSummary: parsed.riskSummary || '',
      },
    };
  } catch (err) {
    console.error('[RiskNode] Error:', err.message);
    return {
      riskAnalysis: {
        risks: [],
        riskScore: 60,
        riskSummary: `Risk analysis failed: ${err.message}`,
      },
      errors: [`Risk analysis failed: ${err.message}`],
    };
  }
}
