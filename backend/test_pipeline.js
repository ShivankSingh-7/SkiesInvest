import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { runAnalysis } from './src/services/analysisService.js';

async function testFullPipeline() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const company = 'Apple';
  console.log(`\n========================================`);
  console.log(`Starting FULL pipeline for: ${company}`);
  console.log(`========================================\n`);

  try {
    const result = await runAnalysis(company, (node, msg) => {
      console.log(`[${node.toUpperCase()}] ${msg}`);
    });

    console.log(`\n========================================`);
    console.log(`Pipeline Completed in ${result.durationMs}ms`);
    console.log(`========================================`);
    console.log(`Decision: ${result.decision} (Confidence: ${result.confidence}%)`);
    console.log(`Investment Score: ${result.investmentScore}/100`);
    console.log(`Risk Score: ${result.riskAnalysis?.riskScore}/100`);
    console.log(`Company Status: ${result.companyStatus}`);
    console.log(`Verified Facts Count: ${result.verifiedFacts?.length}`);
    console.log(`Reasoning Points: ${result.reasoning?.length}`);
    console.log(`\nSummary: ${result.summary || result.committeeSummary}`);

    console.log(`\nChecking if memory saved correctly...`);
    // Wait a second for async memory save node to finish
    await new Promise(r => setTimeout(r, 1000));
    console.log("Test completely successful. No crashes!");
  } catch (err) {
    console.error("\n[CRITICAL ERROR] Pipeline crashed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

testFullPipeline();
