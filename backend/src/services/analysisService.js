import { getGraph } from '../langgraph/graph.js';

/**
 * Analysis Service
 *
 * Orchestrates the full LangGraph pipeline for a company analysis request.
 * The onProgress callback receives real-time updates as each node completes.
 *
 * @param {string} companyName
 * @param {Function} onProgress - (stage, message, details?) => void
 * @returns {Promise<object>} Final analysis result
 */
export async function runAnalysis(companyName, onProgress = () => {}) {
  const graph = getGraph();

  const startTime = Date.now();

  onProgress('init', `Starting analysis for "${companyName}"...`);

  // Run the LangGraph workflow
  const finalState = await graph.invoke({
    companyName,
    onProgress,
    memoryData: null,
    findings: [],
    validatedFindings: [],
    evidenceCoverage: 0,
    financialAnalysis: {
      strengths: [],
      weaknesses: [],
      metrics: {},
      unavailableData: [],
    },
    riskAnalysis: { risks: [], riskScore: 50 },
    decision: {
      decision: 'NEED_MORE_DATA',
      confidence: 0,
      investmentScore: 0,
      reasoning: [],
      verifiedFacts: [],
      unverifiedClaims: [],
      missingInformation: [],
    },
    errors: [],
  });

  const durationMs = Date.now() - startTime;

  // Assemble the response
  return {
    companyName,
    companyStatus: finalState.findings?.company?.status || 'unknown',
    decision: finalState.decision?.decision || 'NEED_MORE_DATA',
    confidence: finalState.decision?.confidence || 0,
    investmentScore: finalState.decision?.investmentScore || 0,
    scoreBreakdown: finalState.decision?.scoreBreakdown || {},
    evidenceCoverage: finalState.evidenceCoverage || 0,
    reasoning: finalState.decision?.reasoning || [],
    verifiedFacts: finalState.decision?.verifiedFacts || [],
    unverifiedClaims: finalState.decision?.unverifiedClaims || [],
    missingInformation: finalState.decision?.missingInformation || [],
    committeeSummary: finalState.decision?.committeeSummary || '',
    findings: finalState.validatedFindings || [],
    financialAnalysis: finalState.financialAnalysis || {},
    riskAnalysis: finalState.riskAnalysis || {},
    memoryUsed: !!finalState.memoryData,
    previousAnalysis: finalState.memoryData?.previousAnalysis || null,
    analysisCount: (finalState.memoryData?.analysisCount || 0) + 1,
    errors: finalState.errors || [],
    durationMs,
    analyzedAt: new Date().toISOString(),
  };
}
