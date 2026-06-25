import { getCompanyMemory, saveCompanyMemory } from '../memory/memoryService.js';

/**
 * Node 1a: Memory Retrieval
 *
 * Loads previous analysis from MongoDB before research begins.
 * If found, injects cached verified facts into state to avoid re-researching.
 */
export async function memoryRetrievalNode(state) {
  const { companyName, onProgress } = state;

  onProgress?.('memory', `Checking memory for previous analysis of "${companyName}"...`);

  try {
    const memoryData = await getCompanyMemory(companyName);

    if (memoryData) {
      const daysSince = Math.floor(
        (Date.now() - new Date(memoryData.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
      );
      onProgress?.(
        'memory',
        `Found previous analysis (${daysSince} days ago, ${memoryData.analysisCount} total analyses)`,
        { found: true, lastUpdated: memoryData.lastUpdated }
      );
    } else {
      onProgress?.('memory', 'No previous analysis found — starting fresh research');
    }

    return { memoryData: memoryData || null };
  } catch (err) {
    console.error('[MemoryNode] Retrieval error:', err.message);
    return { memoryData: null, errors: [`Memory retrieval failed: ${err.message}`] };
  }
}

/**
 * Node 7: Memory Save
 *
 * Persists the completed analysis to MongoDB after the decision is made.
 */
export async function memorySaveNode(state) {
  const { companyName, onProgress } = state;

  onProgress?.('saving', 'Saving analysis to memory for future reference...');

  try {
    await saveCompanyMemory(companyName, {
      decision: state.decision,
      validatedFindings: state.validatedFindings,
      financialAnalysis: state.financialAnalysis,
      riskAnalysis: state.riskAnalysis,
    });

    onProgress?.('saving', 'Analysis saved successfully');
  } catch (err) {
    console.error('[MemoryNode] Save error:', err.message);
  }

  // No state update needed — this node only persists
  return {};
}
