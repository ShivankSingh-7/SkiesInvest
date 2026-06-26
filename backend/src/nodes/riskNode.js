import { callLLM } from '../llm/llmRouter.js';
import { RISK_SYSTEM_PROMPT, buildRiskUserMessage } from '../prompts/riskPrompt.js';

/**
 * Node 5: Risk Analysis Agent
 *
 * Identifies and scores all material risks for the investment.
 * Only reports risks supported by evidence.
 */
export async function riskNode(state) {
  const { companyName, validatedFindings, financialAnalysis, findings, onProgress } = state;

  onProgress?.('risk', 'Evaluating investment risks...');

  if (!validatedFindings || validatedFindings.length === 0) {
    return {
      riskAnalysis: {
        risks: [
          {
            type: 'data_gap',
            title: 'Insufficient Research Data',
            description: 'Unable to assess investment risks due to insufficient research findings.',
            severity: 'high',
            sourceUrls: [],
            mitigatingFactors: null,
          },
        ],
        riskScore: 70,
        riskSummary: 'Risk assessment could not be completed due to insufficient research data.',
      },
    };
  }

  try {
    const userMessage = buildRiskUserMessage(
      companyName,
      validatedFindings,
      financialAnalysis,
      findings
    );
    
    const parsed = await callLLM({
      taskType: 'risk',
      systemPrompt: RISK_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 2000,
      allowFallback: true
    });

    // Normalize risk objects
    const risks = (parsed.risks || []).map((risk) => ({
      type: risk.type || 'market',
      title: risk.title || 'Unnamed Risk',
      description: risk.description || '',
      severity: risk.severity || 'medium',
      sourceUrls: risk.sourceUrls || [],
      mitigatingFactors: risk.mitigatingFactors || null,
      category: risk.category || (risk.hasQuantitativeImpact ? 'Quantitative Risk' : 'Risk Indicator'),
      hasQuantitativeImpact: risk.hasQuantitativeImpact === true,
      financialEvidence: risk.financialEvidence || null,
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
