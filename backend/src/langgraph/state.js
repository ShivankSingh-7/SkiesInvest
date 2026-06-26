import { Annotation } from '@langchain/langgraph';

/**
 * SkiesInvest LangGraph State Schema
 *
 * Each field uses a reducer that replaces the previous value with the new one.
 * The default: () => null/[] ensures the graph initializes cleanly.
 */
export const InvestmentState = Annotation.Root({
  // ── Input ──────────────────────────────────────────────────────────────────
  companyName: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => '',
  }),

  // ── Memory ─────────────────────────────────────────────────────────────────
  memoryData: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => null,
  }),

  // ── Raw Findings (From Research Collector) ─────────────────────────────────
  rawFindings: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => [],
  }),

  // ── Research Findings (Structured Dataset from Consolidator) ───────────────
  findings: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ({
      company: {},
      business: {},
      financials: {},
      market: {},
      competitors: [],
      risks: {},
      leadership: [],
      growth: {},
      recentNews: [],
      verifiedFacts: [],
      sources: [],
      informationGaps: []
    }),
  }),

  // ── Evidence Validated Findings ────────────────────────────────────────────
  validatedFindings: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => [],
  }),

  // ── Evidence Coverage (0-100) ──────────────────────────────────────────────
  evidenceCoverage: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => 0,
  }),

  // ── Financial Analysis ─────────────────────────────────────────────────────
  financialAnalysis: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ({
      strengths: [],
      weaknesses: [],
      metrics: {},
      unavailableData: [],
    }),
  }),

  // ── Risk Analysis ──────────────────────────────────────────────────────────
  riskAnalysis: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ({
      risks: [],
      riskScore: 50,
    }),
  }),

  // ── Final Decision ─────────────────────────────────────────────────────────
  decision: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ({
      decision: 'INCONCLUSIVE',
      confidence: 0,
      informationGap: 0,
      investmentScore: 0,
      summary: '',
      committeeSummary: '',
      strengths: [],
      weaknesses: [],
      risks: [],
      informationGaps: [],
      sources: [],
      reasoning: [],
      verifiedFacts: [],
      unverifiedClaims: [],
      missingInformation: [],
    }),
  }),

  // ── Progress Callback (not serialized, passed externally) ──────────────────
  onProgress: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => null,
  }),

  // ── Errors ─────────────────────────────────────────────────────────────────
  errors: Annotation({
    reducer: (prev, next) => (next ? [...(prev || []), ...next] : prev),
    default: () => [],
  }),
});
