import { StateGraph, START, END } from '@langchain/langgraph';
import { InvestmentState } from './state.js';
import { memoryRetrievalNode } from '../nodes/memoryNode.js';
import { researchNode } from '../nodes/researchNode.js';
import { evidenceNode } from '../nodes/evidenceNode.js';
import { financialNode } from '../nodes/financialNode.js';
import { riskNode } from '../nodes/riskNode.js';
import { decisionNode } from '../nodes/decisionNode.js';
import { memorySaveNode } from '../nodes/memoryNode.js';

import { consolidatorNode } from '../nodes/consolidatorNode.js';

/**
 * Build and compile the SkiesInvest LangGraph workflow.
 *
 * Flow:
 *   START
 *     → memoryRetrieval   (load previous analysis from MongoDB)
 *     → research          (Tavily multi-query research)
 *     → consolidator      (Groq LLM structured JSON conversion)
 *     → evidenceValidation (confidence scoring per finding)
 *     → financialAnalysis  (Groq LLM structured analysis)
 *     → riskAnalysis       (Groq LLM risk scoring)
 *     → investmentCommittee (final INVEST/PASS/NEED_MORE_DATA)
 *     → memorySave         (persist result to MongoDB)
 *   END
 */
export function buildInvestmentGraph() {
  const workflow = new StateGraph(InvestmentState)
    // ── Add Nodes ─────────────────────────────────────────────────────────────
    .addNode('memoryRetrieval', memoryRetrievalNode)
    .addNode('research', researchNode)
    .addNode('consolidator', consolidatorNode)
    .addNode('evidenceValidation', evidenceNode)
    .addNode('financialAnalysisNode', financialNode)
    .addNode('riskAnalysisNode', riskNode)
    .addNode('investmentCommittee', decisionNode)
    .addNode('memorySave', memorySaveNode)

    // ── Define Edges ──────────────────────────────────────────────────────────
    .addEdge(START, 'memoryRetrieval')
    .addEdge('memoryRetrieval', 'research')
    .addEdge('research', 'consolidator')
    .addEdge('consolidator', 'evidenceValidation')
    .addEdge('evidenceValidation', 'financialAnalysisNode')
    .addEdge('financialAnalysisNode', 'riskAnalysisNode')
    .addEdge('riskAnalysisNode', 'investmentCommittee')
    .addEdge('investmentCommittee', 'memorySave')
    .addEdge('memorySave', END);

  return workflow.compile();
}

// Singleton compiled graph
let compiledGraph = null;

export function getGraph() {
  if (!compiledGraph) {
    compiledGraph = buildInvestmentGraph();
  }
  return compiledGraph;
}
