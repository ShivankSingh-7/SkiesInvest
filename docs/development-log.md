# Development Log

## 2026-06-25 — Project Initialized

### Decisions Made
- **Frontend**: React.js + Vite (faster HMR than CRA)
- **Backend**: Node.js + Express (RESTful + SSE streaming)
- **LLM**: Groq with llama-3.3-70b-versatile (fast inference, free tier)
- **Search**: Tavily Search API (real-time web search with structured results)
- **Memory**: MongoDB Atlas + Mongoose

### Architecture Decisions
- SSE (Server-Sent Events) chosen over WebSockets for one-directional progress streaming
- LangGraph StateGraph used for deterministic agent orchestration
- Each node returns only the fields it updates (partial state updates)
- Source quality scoring applied per-URL domain to avoid hallucinated confidence

### Key Challenges
- LangGraph JS API differs from Python — Annotation.Root used for custom state
- Groq structured output requires careful JSON prompt engineering
- Tavily returns variable result quality — source ranking mitigates this
