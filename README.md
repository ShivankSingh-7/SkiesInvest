# 🚀 SkiesInvest — AI Investment Research Agent

> An evidence-based AI Investment Research Agent that analyzes companies like a senior institutional analyst — every claim is sourced, every recommendation is justified.

![SkiesInvest Banner](docs/assets/banner.png)

## 🎯 Project Overview

SkiesInvest is a full-stack AI-powered investment research platform that:
- Researches companies using real-time web search (Tavily)
- Validates every finding with source quality scoring
- Analyzes financials, risks, and market position
- Returns **INVEST**, **PASS**, or **NEED_MORE_DATA** — never hallucinated answers
- Remembers previous analyses to get smarter over time (MongoDB)

## 🧠 Architecture

```
User Input (Company Name)
        ↓
  Memory Retrieval (MongoDB)
        ↓
  Research Agent (Tavily Search)
        ↓
  Evidence Validator (Confidence Scoring)
        ↓
  Financial Analysis Agent (Groq LLM)
        ↓
  Risk Analysis Agent (Groq LLM)
        ↓
  Investment Committee Agent (Final Decision)
        ↓
  Memory Save → Dashboard
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| AI Workflow | LangGraph.js |
| LLM | Groq (llama-3.3-70b-versatile) |
| Search | Tavily Search API |
| Memory | MongoDB + Mongoose |

## 📁 Project Structure

```
SkiesInvest/
├── frontend/          # React.js application
├── backend/           # Node.js + Express API
└── docs/              # Architecture & documentation
```

## ⚙️ Environment Setup

### Backend (`backend/.env`)
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/skiesinvest
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ShivankSingh-7/SkiesInvest.git
cd SkiesInvest
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 4. Configure Environment Variables
- Copy `backend/.env.example` → `backend/.env`
- Fill in your API keys

### 5. Start Development Servers
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### 6. Open in browser
Visit `http://localhost:5173`

## 🔬 How It Works

### Investment Decisions
| Decision | Meaning |
|----------|---------|
| ✅ INVEST | Strong evidence supports investment |
| ❌ PASS | Evidence suggests avoiding |
| 🔶 NEED_MORE_DATA | Insufficient verified information |

### Source Quality Ranking
| Source | Quality Score |
|--------|--------------|
| SEC Filings | 100 |
| Annual Reports | 95 |
| Reuters / Bloomberg | 90 |
| Yahoo Finance / CNBC | 80 |
| General News | 60 |
| Unknown Sources | 20 |

### Confidence Formula
```
5+ reliable sources → 95% confidence
3-4 sources         → 80% confidence
2 sources           → 65% confidence
1 source            → 40% confidence
0 sources           → 0% confidence
```

## 📊 Features

- [x] Multi-node LangGraph AI workflow
- [x] Real-time research via Tavily
- [x] Evidence validation with source scoring
- [x] Financial & risk analysis
- [x] Evidence-backed recommendations only
- [x] Long-term memory with MongoDB
- [x] Company history comparison
- [x] SSE streaming for live progress
- [x] Premium glassmorphism UI

## 🔮 Future Improvements

- [ ] Portfolio tracking dashboard
- [ ] Email alerts for company changes
- [ ] PDF report generation
- [ ] Multi-company comparison
- [ ] Sentiment analysis from social media
- [ ] SEC filing parser

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with ❤️ by [Shivank Singh](https://github.com/ShivankSingh-7)
