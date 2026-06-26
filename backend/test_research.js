import { researchNode } from './src/nodes/researchNode.js';
import { consolidatorNode } from './src/nodes/consolidatorNode.js';
import { evidenceNode } from './src/nodes/evidenceNode.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log("Testing researchNode...");
  const res = await researchNode({ companyName: 'NVIDIA' });
  console.log("Raw findings count:", res.rawFindings?.length);
  
  console.log("Testing consolidatorNode...");
  const cons = await consolidatorNode({ companyName: 'NVIDIA', rawFindings: res.rawFindings });
  console.log("Structured findings keys:", Object.keys(cons.findings || {}));
  console.log("Verified facts count:", cons.findings?.verifiedFacts?.length);

  console.log("Testing evidenceNode...");
  const ev = await evidenceNode({ findings: cons.findings, companyName: 'NVIDIA' });
  console.log("Validated findings count:", ev.validatedFindings.length);
  console.log("Evidence Coverage:", ev.evidenceCoverage);
}

test();
