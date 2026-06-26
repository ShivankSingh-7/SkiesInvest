import { callLLM } from '../llm/llmRouter.js';
import { FINANCIAL_SYSTEM_PROMPT, buildFinancialUserMessage } from '../prompts/financialPrompt.js';

/**
 * Node 4: Financial Analysis Agent
 *
 * Evaluates the financial health, business model, and market position.
 * Returns strengths, weaknesses, and a structured analysis based ONLY on verified findings.
 */
export async function financialNode(state) {
  const { companyName, validatedFindings, findings, onProgress } = state;

  onProgress?.('financial', 'Analyzing financials, business model, and market position...');

  if (!validatedFindings || validatedFindings.length === 0) {
    return {
      financialAnalysis: {
        strengths: [],
        weaknesses: [],
        metrics: { revenue: 'Unknown', profitability: 'Unknown', debt: 'Unknown', marketCap: 'Unknown' },
        businessModel: 'Unknown',
        marketPosition: 'Unknown',
        unavailableData: ['All financial and market data'],
        financialSummary: 'Financial analysis could not be completed due to insufficient research data.',
      },
    };
  }

  try {
    const userMessage = buildFinancialUserMessage(companyName, validatedFindings, findings);
    
    const parsed = await callLLM({
      taskType: 'financial',
      systemPrompt: FINANCIAL_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 800,
      allowFallback: false // Critical reasoning task, do NOT fallback
    });

    // Normalize the strengths and weaknesses to always be objects with point + sourceUrls
    const normalizeItems = (items) =>
      (items || []).map((item) => {
        if (typeof item === 'string') {
          return { point: item, sourceUrls: [], confidence: 50 };
        }
        return {
          point: item.point || item.statement || String(item),
          sourceUrls: item.sourceUrls || [],
          confidence: item.confidence || 60,
        };
      });

    const financialAnalysis = {
      strengths: normalizeItems(parsed.strengths),
      weaknesses: normalizeItems(parsed.weaknesses),
      metrics: parsed.metrics || {},
      unavailableData: parsed.unavailableData || [],
      analystNote: parsed.analystNote || '',
    };

    onProgress?.(
      'financial',
      `Financial analysis complete: ${financialAnalysis.strengths.length} strengths, ${financialAnalysis.weaknesses.length} weaknesses`,
      {
        strengthCount: financialAnalysis.strengths.length,
        weaknessCount: financialAnalysis.weaknesses.length,
        missingDataCount: financialAnalysis.unavailableData.length,
      }
    );

    return { financialAnalysis };
  } catch (err) {
    console.error('[FinancialNode] Error:', err.message);
    return {
      financialAnalysis: {
        strengths: [],
        weaknesses: [],
        metrics: { revenueGrowth: 'DATA UNAVAILABLE' },
        unavailableData: ['Financial analysis failed — data unavailable'],
        analystNote: `Analysis error: ${err.message}`,
      },
      errors: [`Financial analysis failed: ${err.message}`],
    };
  }
}
