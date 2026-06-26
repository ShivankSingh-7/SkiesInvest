import { researchNode } from './src/nodes/researchNode.js';
import { evidenceNode } from './src/nodes/evidenceNode.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log("Testing researchNode...");
  const res = await researchNode({ companyName: 'NVIDIA' });
  console.log("Research findings structure:", Object.keys(res.findings));
  console.log("Verified facts count:", res.findings.verifiedFacts?.length);
  
  console.log("Testing evidenceNode...");
  const ev = await evidenceNode({ findings: res.findings, companyName: 'NVIDIA' });
  console.log("Validated findings count:", ev.validatedFindings.length);
  console.log("Evidence Coverage:", ev.evidenceCoverage);
}

test();
