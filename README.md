# SkiesInvest

SkiesInvest is an AI-powered investment research platform that acts as your virtual investment committee. By simply entering a company name, the system deploys a team of AI agents to dynamically scrape real-time financial data, validate facts, assess risks, and produce a clear "INVEST", "WATCH", or "PASS" recommendation.

## What It Does
Instead of relying on a single AI prompt (which often hallucinates or skips instructions), SkiesInvest uses a multi-agent system. Specialized agents handle different parts of the research process:
* **Searching:** Finds the latest news and financial reports.
* **Fact-Checking:** Validates claims against authoritative sources (like Bloomberg or Reuters).
* **Memory:** Remembers past analyses (using MongoDB) to detect if a company is improving or decaying over time.
* **Math-Based Decisions:** The final "Invest" or "Pass" decision isn't made by an emotional AI—it's calculated by a hardcoded mathematical engine that weighs growth, debt, and market position.

## How to Run It (Setup)

The project is split into two folders: `backend` (Node.js) and `frontend` (React/Vite). You'll need to run both.

### 1. Backend Setup
1. Open a terminal and go to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the backend folder and add your keys:
   ```env
   GROQ_API_KEY=your_groq_api_key
   TAVILY_API_KEY=your_tavily_api_key
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the server: `npm run dev`

### 2. Frontend Setup
1. Open a new terminal and go to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the frontend folder:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend: `npm run dev`
5. Open your browser to `http://localhost:5173`

## How It Works (The Architecture)

I used **LangGraph** to build this as an "assembly line" of AI agents. 
* First, the **Researcher** agent hits the web for data.
* Second, the **Consolidator** cleans up that messy data into bullet points.
* Third, the **Fact-Checker** verifies the sources.
* Finally, everything is handed to a **Deterministic Calculator** (written in JavaScript). This is important: I didn't want the AI making the final financial call because AI can panic over minor news. The calculator does the math, and forces the "INVEST" or "PASS" decision based on strict numbers (like penalizing heavy debt or factoring in the slow growth of massive trillion-dollar companies).

I used **Groq** for the AI model because we have to run multiple agents back-to-back. Groq is incredibly fast, bringing a process that would normally take a minute down to just a few seconds. 

The UI was built with a minimalist, professional SaaS design (inspired by Stripe and Vercel) so it feels like a trustworthy financial tool rather than a flashy AI toy.

## Key Decisions & Trade-Offs

* **LangGraph over a Mega-Prompt:** Breaking the task down into smaller agents makes the AI much more reliable and easier to debug.
* **Math over AI:** As mentioned, taking the final decision power away from the AI and giving it to a simple math formula prevents the system from making subjective mistakes.
* **No Stock APIs (Trade-off):** I intentionally didn't plug in a live stock market API (like Yahoo Finance). I wanted to prove that the AI could synthesize unstructured news text into financial insights on its own. 
* **No User Logins (Trade-off):** I skipped adding sign-up screens so I could focus 100% of my time on making the AI pipeline smart and fast.

## What I Would Improve With More Time

1. **Stock API Integration:** I'd eventually plug in a real stock API to get a month of historical price data. Hard numbers combined with news analysis would make it even more accurate.
2. **Interactive Chat:** It would be great to add a chat box at the bottom of the report. If a user is confused about a specific risk, they could just ask the AI to explain its reasoning.
3. **Caching:** If two people search for "Apple" on the same day, the backend should just instantly show the saved report instead of re-running the expensive AI agents.

## Bonus: AI Collaboration Logs
Throughout this build, I worked closely with an LLM to debug and design the architecture. Here are a few examples of how I directed the project:

**On fixing the AI's subjective bias:**
> *Me:* "Look at this output for Microsoft. It has a high investment score but the AI is still suggesting to 'WATCH'. Don't include the LLM model to decide. Instead, have if/else logic: if investment score <= 40 and confidence >= 60, then don't invest. If score >= 65 and confidence > 70, then invest."
> *AI:* "Brilliant. I have updated the calculator to completely enforce your specific if/else rules, taking the final decision completely out of the LLM's hands."

**On deploying and fixing CORS:**
> *Me:* "I deployed the backend to Render and frontend to Vercel. But I'm getting blocked by CORS policy. The header has a trailing slash that is not equal to the supplied origin."
> *AI:* "Ah, the browser's strict CORS policy requires no trailing slash. I just updated `server.js` to automatically parse and strip out any accidental trailing slashes dynamically to fix the Render deployment."
