import { callGroqJSON } from '../llm/groq.js';
import { FINANCIAL_SYSTEM_PROMPT, buildFinancialUserMessage } from '../prompts/financialPrompt.js';

/**
 * Node 4: Financial Analysis Agent
 *
 * Uses Groq LLM to analyze research findings for financial health,
 * strengths, weaknesses, and key metrics.
 *
 * Strict rule: If data is not in research findings, marks as DATA UNAVAILABLE.
 */
export async function financialNode(state) {
  const { companyName, validatedFindings, findings, onProgress } = state;

  onProgress?.('financial', 'Performing financial analysis...');

  if (!validatedFindings || validatedFindings.length === 0) {
    onProgress?.('financial', 'No validated findings for financial analysis');
    return {
      financialAnalysis: {
        strengths: [],
        weaknesses: [],
        metrics: {
          revenueGrowth: 'DATA UNAVAILABLE',
          profitability: 'DATA UNAVAILABLE',
          marketPosition: 'DATA UNAVAILABLE',
          fundingStatus: 'DATA UNAVAILABLE',
          competitiveAdvantage: 'DATA UNAVAILABLE',
          businessModel: 'DATA UNAVAILABLE',
        },
        unavailableData: [
          'Revenue data unavailable',
          'Profitability data unavailable',
          'Market position data unavailable',
          'Funding information unavailable',
        ],
        analystNote: 'Insufficient research data for financial analysis',
      },
    };
  }

  try {
    const userMessage = buildFinancialUserMessage(companyName, validatedFindings, findings);
    const parsed = await callGroqJSON(FINANCIAL_SYSTEM_PROMPT, userMessage);

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
