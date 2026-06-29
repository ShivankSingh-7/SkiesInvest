import mongoose from 'mongoose';
import CompanyMemory from '../models/CompanyMemory.js';

/**
 * Check if MongoDB is connected
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Retrieve a company's previous analysis from MongoDB
 *
 * @param {string} companyName
 * @returns {Promise<object|null>}
 */
export async function getCompanyMemory(companyName) {
  if (!isConnected()) {
    console.warn('[Memory] MongoDB not connected — skipping memory retrieval');
    return null;
  }

  try {
    const normalized = companyName.toLowerCase().trim();
    const record = await CompanyMemory.findOne({ companyName: normalized }).lean();
    return record || null;
  } catch (err) {
    console.error('[Memory] Error retrieving company memory:', err.message);
    return null;
  }
}

/**
 * Save or update a company's analysis in MongoDB
 *
 * @param {string} companyName
 * @param {object} analysisData
 * @returns {Promise<void>}
 */
export async function saveCompanyMemory(companyName, analysisData) {
  if (!isConnected()) {
    console.warn('[Memory] MongoDB not connected — skipping memory save');
    return;
  }

  try {
    const normalized = companyName.toLowerCase().trim();

    const updateData = {
      displayName: companyName,
      companyStatus: analysisData.findings?.company?.status || 'unknown',
      previousAnalysis: analysisData.decision,
      verifiedFacts: analysisData.decision?.verifiedFacts || [],
      unverifiedClaims: analysisData.decision?.unverifiedClaims || [],
      sourceLinks: extractSourceLinks(analysisData.validatedFindings),
      findings: (analysisData.validatedFindings || []).slice(0, 20), // Cap at 20
      financialAnalysis: analysisData.financialAnalysis || {},
      riskAnalysis: analysisData.riskAnalysis || {},
      lastUpdated: new Date(),
    };

    await CompanyMemory.findOneAndUpdate(
      { companyName: normalized },
      {
        $set: updateData,
        $inc: { analysisCount: 1 },
        $setOnInsert: { companyName: normalized },
      },
      { upsert: true, new: true }
    );

    console.log(`[Memory] Saved analysis for: ${companyName}`);
  } catch (err) {
    console.error('[Memory] Error saving company memory:', err.message);
  }
}

/**
 * Get recent analyses list
 *
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getRecentAnalyses(limit = 10) {
  if (!isConnected()) return [];

  try {
    return await CompanyMemory.find({})
      .sort({ lastUpdated: -1 })
      .limit(limit)
      .select('displayName companyName previousAnalysis lastUpdated analysisCount')
      .lean();
  } catch (err) {
    console.error('[Memory] Error getting recent analyses:', err.message);
    return [];
  }
}

/**
 * Get company analysis history by name
 */
export async function getCompanyHistory(companyName) {
  return getCompanyMemory(companyName);
}

/**
 * Extract unique source URLs from validated findings
 */
function extractSourceLinks(validatedFindings) {
  const urls = new Set();
  for (const finding of validatedFindings || []) {
    for (const source of finding.sources || []) {
      if (source.url) urls.add(source.url);
    }
  }
  return Array.from(urls).slice(0, 50); // Cap at 50 URLs
}
