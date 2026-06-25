# Architecture Overview

## System Architecture

SkiesInvest uses a multi-agent LangGraph workflow to research and analyze companies.

## LangGraph Nodes

### Node 1: Memory Retrieval
- Queries MongoDB for previous analysis of the company
- If found, injects cached verified facts into the state
- Reduces redundant API calls

### Node 2: Research Agent
- Executes 6-8 Tavily searches with different queries
- Collects real URLs and source metadata
- Stores every finding as a structured object

### Node 3: Evidence Validator
- Scores each finding by source quality
- Calculates confidence based on number of reliable sources
- Marks unverifiable claims explicitly

### Node 4: Financial Analysis Agent
- Uses Groq LLM to analyze research findings
- Extracts revenue signals, profitability, market position
- Refuses to invent unavailable data

### Node 5: Risk Analysis Agent
- Analyzes competition, regulatory, financial, operational, market risks
- Returns a 0-100 risk score

### Node 6: Investment Committee Agent
- Senior analyst persona
- Returns INVEST / PASS / NEED_MORE_DATA
- Every reason must cite a source

## API Contract

### POST /api/analyze
**Request:**
```json
{ "companyName": "Apple Inc" }
```

**SSE Stream Events:**
```
event: progress
data: {"stage": "research", "message": "Searching for Apple Inc..."}

event: complete
data: { ...full analysis result... }
```

## Source Quality Scoring

| Domain | Score |
|--------|-------|
| sec.gov | 100 |
| Annual Reports | 95 |
| ir.* (Investor Relations) | 90 |
| reuters.com | 90 |
| bloomberg.com | 90 |
| finance.yahoo.com | 80 |
| cnbc.com | 80 |
| forbes.com | 70 |
| techcrunch.com | 65 |
| General news | 50 |
| Random blogs | 30 |
| Unknown | 20 |

## Investment Score Formula

```
investmentScore = (
  growthScore        * 0.30 +
  marketPositionScore * 0.25 +
  (100 - riskScore)  * 0.25 +
  evidenceQuality    * 0.20
)
```
