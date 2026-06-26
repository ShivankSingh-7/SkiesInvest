import { callLLM } from '../llm/llmRouter.js';
import { DECISION_SYSTEM_PROMPT, buildDecisionUserMessage } from '../prompts/decisionPrompt.js';
import { calculateInvestmentScore, determineDecisionThreshold } from '../utils/scoreCalculator.js';

/**
 * Node 6: Investment Committee Agent
 *
 * The final decision-making node. Acts as a senior investment committee.
 * Returns INVEST / WATCH / PASS / INCONCLUSIVE based on all evidence.
 */
export async function decisionNode(state) {
  const {
    companyName,
    validatedFindings,
    financialAnalysis,
    riskAnalysis,
    evidenceCoverage,
    findings,
    onProgress,
  } = state;

  onProgress?.('decision', 'Investment committee reviewing all evidence...');

  // Calculate investment score
  const { investmentScore, breakdown } = calculateInvestmentScore({
    companyName,
    financialAnalysis,
    riskAnalysis,
    evidenceCoverage,
    validatedFindings,
  });
  
  // CRITICAL OVERRIDE: The LLM frequently hallucinates its own riskScore despite strict prompts.
  // We must OVERRIDE the raw LLM riskScore with our perfectly calculated deterministic score 
  // before the final decision prompt is executed and state is returned.
  if (riskAnalysis) {
    riskAnalysis.riskScore = breakdown.deterministicRiskScore || 0;
  }

  onProgress?.(
    'decision',
    `Investment score: ${investmentScore}/100 — committee making final decision...`,
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
      informationGaps: findings?.informationGaps || [],
    });

    const parsed = await callLLM({
      taskType: 'decision',
      systemPrompt: DECISION_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 2000,
      allowFallback: true
    });

    // Clamp confidence and informationGap
    const confidence    = Math.min(99, Math.max(0, parseInt(parsed.confidence, 10)    || 50));
    const informationGap = Math.min(100, Math.max(0, parseInt(parsed.informationGap, 10) || 0));

    // CRITICAL OVERRIDE: The LLM frequently makes subjective decisions that violate the calculated investment score.
    // We enforce the deterministic decision threshold based on the calculated score, risk, and coverage.
    let decision = determineDecisionThreshold(
      investmentScore,
      confidence,
      evidenceCoverage,
      breakdown.deterministicRiskScore
    );
    
    // Normalize "Don't Invest" to "PASS" for frontend consistency
    if (decision === "Don't Invest") {
      decision = 'PASS';
    }

    const validDecisions = ['INVEST', 'WATCH', 'PASS', 'INCONCLUSIVE'];
    if (!validDecisions.includes(decision)) {
      decision = 'INCONCLUSIVE';
    }

    // Normalize reasoning
    const reasoning = (parsed.reasoning || []).map((r) => {
      if (typeof r === 'string') return { point: r, type: 'neutral', sourceUrls: [], weight: 'medium' };
      return {
        point: r.point || r.statement || String(r),
        type: r.type || 'neutral',
        sourceUrls: r.sourceUrls || [],
        weight: r.weight || 'medium',
      };
    });

    // Normalize verifiedFacts
    const verifiedFacts = (parsed.verifiedFacts || []).map((f) => {
      if (typeof f === 'string') return { fact: f, sourceUrls: [] };
      return { fact: f.fact || String(f), sourceUrls: f.sourceUrls || [] };
    });

    const result = {
      decision,
      confidence,
      informationGap,
      investmentScore,
      scoreBreakdown: breakdown,
      // New fields from updated prompt
      summary: parsed.summary || parsed.committeeSummary || '',
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      risks: parsed.risks || [],
      informationGaps: parsed.informationGaps || parsed.missingInformation || [],
      sources: parsed.sources || [],
      reasoning,
      verifiedFacts,
      // Keep backwards-compatible aliases
      committeeSummary: parsed.summary || parsed.committeeSummary || '',
      missingInformation: parsed.informationGaps || parsed.missingInformation || [],
      unverifiedClaims: parsed.unverifiedClaims || [],
    };

    onProgress?.(
      'decision',
      `Decision: ${decision} (${confidence}% confidence, score: ${investmentScore}/100)`,
      { decision, confidence, investmentScore }
    );

    return { decision: result };
  } catch (err) {
    console.error('[DecisionNode] Error:', err.message);

    return {
      decision: {
        decision: 'INCONCLUSIVE',
        confidence: 0,
        informationGap: 100,
        investmentScore,
        scoreBreakdown: breakdown,
        summary: 'Automated decision failed. Please review manually.',
        committeeSummary: 'Automated decision failed. Please review manually.',
        strengths: [],
        weaknesses: [],
        risks: [],
        informationGaps: [`Decision analysis failed: ${err.message}`],
        missingInformation: [`Decision analysis failed: ${err.message}`],
        sources: [],
        reasoning: [{
          point: 'Decision engine encountered an error — manual review required',
          type: 'negative',
          sourceUrls: [],
          weight: 'high',
        }],
        verifiedFacts: [],
        unverifiedClaims: [],
      },
      errors: [`Decision node failed: ${err.message}`],
    };
  }
}
