import { callGroqJSON } from '../llm/groq.js';
import { DECISION_SYSTEM_PROMPT, buildDecisionUserMessage } from '../prompts/decisionPrompt.js';
import { calculateInvestmentScore } from '../utils/scoreCalculator.js';

/**
 * Node 6: Investment Committee Agent
 *
 * The final decision-making node. Acts as a senior investment analyst.
 * Returns INVEST / PASS / NEED_MORE_DATA based on all evidence.
 */
export async function decisionNode(state) {
  const {
    companyName,
    validatedFindings,
    financialAnalysis,
    riskAnalysis,
    evidenceCoverage,
    onProgress,
  } = state;

  onProgress?.('decision', 'Investment committee reviewing all evidence...');

  // Calculate investment score
  const { investmentScore, breakdown } = calculateInvestmentScore({
    financialAnalysis,
    riskAnalysis,
    evidenceCoverage,
    validatedFindings,
  });

  onProgress?.(
    'decision',
    `Investment score calculated: ${investmentScore}/100 — committee making final decision...`,
    { investmentScore, breakdown }
  );

  try {
    const userMessage = buildDecisionUserMessage({
      companyName,
      investmentScore,
      evidenceCoverage,
      validatedFindings,
      financialAnalysis,
      riskAnalysis,
    });

    const parsed = await callGroqJSON(DECISION_SYSTEM_PROMPT, userMessage);

    // Validate decision value
    const validDecisions = ['INVEST', 'PASS', 'NEED_MORE_DATA'];
    const decision = validDecisions.includes(parsed.decision)
      ? parsed.decision
      : 'NEED_MORE_DATA';

    // Clamp confidence
    const confidence = Math.min(99, Math.max(0, parseInt(parsed.confidence, 10) || 50));

    // Normalize reasoning items
    const reasoning = (parsed.reasoning || []).map((r) => {
      if (typeof r === 'string') {
        return { point: r, type: 'neutral', sourceUrls: [], weight: 'medium' };
      }
      return {
        point: r.point || r.statement || String(r),
        type: r.type || 'neutral',
        sourceUrls: r.sourceUrls || [],
        weight: r.weight || 'medium',
      };
    });

    const verifiedFacts = (parsed.verifiedFacts || []).map((f) => {
      if (typeof f === 'string') return { fact: f, sourceUrls: [] };
      return { fact: f.fact || String(f), sourceUrls: f.sourceUrls || [] };
    });

    const result = {
      decision,
      confidence,
      investmentScore,
      scoreBreakdown: breakdown,
      reasoning,
      verifiedFacts,
      unverifiedClaims: parsed.unverifiedClaims || [],
      missingInformation: parsed.missingInformation || [],
      committeeSummary: parsed.committeeSummary || '',
    };

    onProgress?.(
      'decision',
      `Decision: ${decision} (${confidence}% confidence, score: ${investmentScore}/100)`,
      { decision, confidence, investmentScore }
    );

    return { decision: result };
  } catch (err) {
    console.error('[DecisionNode] Error:', err.message);

    // Conservative fallback
    return {
      decision: {
        decision: 'NEED_MORE_DATA',
        confidence: 0,
        investmentScore,
        scoreBreakdown: breakdown,
        reasoning: [
          {
            point: 'Decision engine encountered an error — manual review required',
            type: 'negative',
            sourceUrls: [],
            weight: 'high',
          },
        ],
        verifiedFacts: [],
        unverifiedClaims: [],
        missingInformation: [`Decision analysis failed: ${err.message}`],
        committeeSummary: 'Automated decision failed. Please review manually.',
      },
      errors: [`Decision node failed: ${err.message}`],
    };
  }
}
