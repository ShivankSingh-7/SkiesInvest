# AI Prompts Reference

## Research Agent System Prompt

The research agent is instructed to:
- Search for company-specific information only
- Return structured JSON findings
- Include source URL and title for every finding
- Never invent information not found in search results

## Evidence Validator System Prompt

The evidence validator:
- Scores each finding by source reliability
- Aggregates confidence scores across sources
- Flags weak evidence (single source, unknown domain)
- Returns explicit "unavailable" markers for missing data

## Financial Analysis Agent System Prompt

The financial agent:
- Analyzes only what is present in the research findings
- Returns "DATA UNAVAILABLE" for missing metrics
- Separates verified strengths from unconfirmed signals
- Never assumes profitability, revenue, or growth

## Risk Analysis Agent System Prompt

The risk agent:
- Identifies specific risks with evidence
- Scores each risk 0-100 by severity
- Aggregates a composite risk score
- Cites sources for every identified risk

## Investment Committee Agent System Prompt

The committee agent:
- Acts as a senior institutional analyst
- Returns INVEST only with high confidence (>75%)
- Returns NEED_MORE_DATA when evidence coverage < 60%
- Returns PASS when risk score > 70 or evidence is weak
- Never forces a recommendation without sufficient data
