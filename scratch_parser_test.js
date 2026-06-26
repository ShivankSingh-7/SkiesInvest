import { parseJSONWithRecovery } from './backend/src/utils/jsonParser.js';

// Mock repair model
const mockGroqModel = {
  invoke: async (messages) => {
    console.log("Mock Groq invoked with messages:", messages);
    return {
      content: '{"repaired": true, "message": "Success from LLM"}'
    };
  }
};

async function runTests() {
  console.log("--- Test 1: Clean JSON (LangChain Native Parse) ---");
  const t1 = await parseJSONWithRecovery('{"status": "ok"}', mockGroqModel);
  console.log("Result 1:", t1);
  
  console.log("\n--- Test 2: Trailing Comma & Markdown (Local Cleanup) ---");
  const t2 = await parseJSONWithRecovery('Here is your json:\n```json\n{\n  "data": 123,\n}\n```\nExplanation.', mockGroqModel);
  console.log("Result 2:", t2);

  console.log("\n--- Test 3: Completely Broken JSON (LLM Repair) ---");
  const t3 = await parseJSONWithRecovery('this is just raw text { missing quotes: true', mockGroqModel);
  console.log("Result 3:", t3);
}

runTests().catch(console.error);
