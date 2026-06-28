# SkiesInvest

🚀 **Live Demo:** [https://skies-invest.vercel.app/](https://skies-invest.vercel.app/)

*(Note: The frontend is deployed on Vercel, and the backend is hosted on Render at https://skiesinvest.onrender.com)*

SkiesInvest is an autonomous, AI-powered investment research platform. By entering a company name, the platform deploys a multi-agent system to scrape real-time financial data, validate facts, assess risks, and produce a definitive "INVEST", "WATCH", or "PASS" recommendation.

## ✨ Features

* **Multi-Agent Pipeline:** Instead of relying on a single AI prompt, the system breaks research down into discrete steps (Search, Consolidate, Validate, Score) using LangGraph.
* **Fact-Checking Engine:** Automatically validates claims against authoritative sources. Unverified claims are heavily penalized.
* **Deterministic Scoring:** The final decision is mathematically calculated based on growth, debt, and market position. The AI is not allowed to override the math, preventing subjective hallucinations.
* **Temporal Memory:** Backed by MongoDB, the system remembers past analyses to detect if a company's fundamentals are improving or decaying over time.
* **Live SaaS Interface:** A premium, minimalist UI that streams the agents' live "thought process" as they build the report.

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS (Custom Minimalist Theme)
* **Backend:** Node.js, Express, LangGraph, MongoDB
* **AI & Search:** Groq (llama-3.3-70b) for high-speed inference, Tavily Search API

## 🚀 Getting Started

To run this project locally, you will need to start both the backend and frontend servers.

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
MONGODB_URI=your_mongodb_uri
PORT=5000
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

## 🧠 Development & Architecture Notes

Building this platform required balancing AI flexibility with financial reliability. 

* **Why LangGraph?** Early prototypes using a single "mega-prompt" proved unreliable. Breaking the architecture into specialized agents made the pipeline highly debuggable and allowed for real-time progress streaming to the UI.
* **Why Deterministic Math?** LLMs are highly susceptible to emotional bias (e.g., panicking over a minor lawsuit). To ensure reliability, the final investment recommendation is hardcoded in JavaScript. The LLM only summarizes the data, while the math dictates the decision.
* **AI Collaboration:** This project was developed through extensive pair-programming with an LLM. We iteratively brainstormed business logic (e.g., penalizing high-debt companies mathematically), refined the UI to meet strict professional SaaS standards, and debugged complex deployment CORS issues dynamically.

## 🗺️ Future Roadmap

- [ ] **Real-Time Stock API Integration:** Connect to Yahoo Finance or Alpha Vantage to overlay hard ticker data with the AI's news analysis.
- [ ] **Interactive Chat:** Allow users to chat directly with the final report to ask follow-up questions about specific flagged risks.
- [ ] **Result Caching:** Cache reports in the database to save API costs on duplicate searches.
