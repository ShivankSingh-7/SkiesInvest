import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  type: String,
  qualityScore: Number,
}, { _id: false });

const FindingSchema = new mongoose.Schema({
  statement: String,
  confidence: Number,
  sourceCount: Number,
  sources: [SourceSchema],
  query: String,
}, { _id: false });

const RiskSchema = new mongoose.Schema({
  type: String,
  description: String,
  severity: String,
  sources: [SourceSchema],
}, { _id: false });

const CompanyMemorySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      // Indexed via schema.index() at bottom — do not add index:true here
      set: (v) => v?.toLowerCase().trim(),
    },
    displayName: {
      type: String, // Original casing for display
    },
    companyStatus: {
      type: String, // Public or Private
      default: 'unknown'
    },
    previousAnalysis: {
      decision: String,
      confidence: Number,
      investmentScore: Number,
      evidenceCoverage: Number,
      reasoning: [mongoose.Schema.Types.Mixed],
      verifiedFacts: [mongoose.Schema.Types.Mixed],
      unverifiedClaims: [mongoose.Schema.Types.Mixed],
      missingInformation: [mongoose.Schema.Types.Mixed],
    },
    verifiedFacts: [mongoose.Schema.Types.Mixed],
    unverifiedClaims: [mongoose.Schema.Types.Mixed],
    sourceLinks: [String],
    findings: [FindingSchema],
    financialAnalysis: {
      strengths: [mongoose.Schema.Types.Mixed],
      weaknesses: [mongoose.Schema.Types.Mixed],
      unavailableData: [mongoose.Schema.Types.Mixed],
      metrics: mongoose.Schema.Types.Mixed,
    },
    riskAnalysis: {
      risks: [RiskSchema],
      riskScore: Number,
    },
    analysisCount: {
      type: Number,
      default: 1,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index on normalized company name
CompanyMemorySchema.index({ companyName: 1 }, { unique: true });

export default mongoose.model('CompanyMemory', CompanyMemorySchema);
