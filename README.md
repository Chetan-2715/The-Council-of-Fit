
# 🏛️ The Council of Fit
### *An Agentic Fitness Arbitration System*

![Status](https://img.shields.io/badge/Status-Hackathon_Complete-success) ![Tech](https://img.shields.io/badge/AI-CrewAI_%7C_Gemini_1.5_Flash-blue) ![Tool](https://img.shields.io/badge/Tool-Google_Calendar_Integration-yellow)

---

## 1. 🔍 Problem Definition
**"Why do fitness apps fail?"**
Most fitness apps are passive trackers. They show you data (e.g., "You slept 5 hours"), but they don't **act** on it. Users are left to decide: *"Should I push through the fatigue or rest?"* This decision fatigue often leads to burnout or injury.

**The Solution:**
**The Council of Fit** is an Agentic System that removes the burden of decision-making. Instead of a static algorithm, we simulate a **live debate** between opposing fitness philosophies:
* **The Drill Sergeant:** Prioritizes intensity and consistency.
* **The Zen Master:** Prioritizes recovery and longevity.
* **The Head Coach:** Arbitrates the debate and **executes** the final decision to your real-world calendar.

---

## 2. 🧠 Agentic Architecture

The system uses **CrewAI** to orchestrate a multi-agent workflow. We use a unique **"Simulated Debate" pattern** to maximize reasoning depth while minimizing API latency.

```mermaid
graph TD
    User((User Input)) -->|JSON: Sleep, Stress, Goals| Debate[Agent 1: Debate Moderator]
    
    subgraph "The Council (Gemini 1.5 Flash)"
        Debate -->|Generates Script| Script[Drill Sergeant vs Zen Master]
        Script -->|Critique & Rebuttal| Coach[Agent 2: Head Coach]
    end
    
    Coach -->|Final Verdict (JSON)| Tools
    
    subgraph "Tool Use (Action)"
        Tools -->|Schedule Event| GCal[Google Calendar API]
        Tools -->|Log Decision| UI[React Frontend]
    end

```

### **The Agents**

| Agent | Role | Philosophy |
| --- | --- | --- |
| **Drill Sergeant** | **Performance** | *"If you aren't shaking, you wasted your time."* Advocating for progressive overload. |
| **Zen Master** | **Recovery** | *"Hypertrophy demands adaptation, not exhaustion."* Advocating for cortisol management. |
| **Head Coach** | **Executor** | The final authority. Parses the debate, applies constraints (time/calendar), and triggers the Calendar Tool. |

---

## 3. 🛠️ Tech Stack & Implementation

This project follows the **"Software Only"** track, utilizing open-source frameworks and free-tier APIs.

* **Orchestration:** [CrewAI](https://github.com/joaomdmoura/crewAI) (Python) - Manages agent roles and task delegation.
* **LLM Engine:** **Google Gemini 1.5 Flash** (via LangChain) - chosen for its high speed and large context window (essential for handling debate scripts).
* **Backend:** FastAPI - Serves the agentic workflow as a REST API.
* **Frontend:** React + Vite - Displays the "live" debate transparency logs.
* **Tooling:** **Google Calendar API** - Allows the agents to perform real-world actions.

---

## 4. 🚀 Setup & Execution

### **Prerequisites**

* Python 3.10+
* Node.js 16+
* A Google Cloud Project with **Calendar API** enabled.

### **Step 1: Backend Setup**

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt

```

### **Step 2: Environment Variables**

Create a `.env` file in the `backend/` folder:

```ini
GOOGLE_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

*Note: Place your `credentials.json` (from Google Cloud) in the `backend/` folder for Calendar access.*

### **Step 3: Frontend Setup**

```bash
cd frontend
npm install
npm run dev

```

### **Step 4: Running the System**

1. Start the Backend: `python main.py`
2. Start the Frontend: `npm run dev`
3. Open `http://localhost:5173`.
4. Enter your stats (e.g., Sleep: 4 hours, Goal: Muscle).
5. **Watch the debate unfold and check your Google Calendar!**

---

## 5. 🌟 Key Innovations

1. **Transparency:** Unlike black-box models, the user sees *exactly* why a decision was made by reading the debate transcript.
2. **Conflict-Driven Reasoning:** By forcing agents to argue, we reduce hallucinations and ensure both safety (Zen) and progress (Drill) are considered.
3. **True Agency:** The system doesn't just suggest; it **schedules**. It modifies the user's environment.

---

## 6. ⚠️ Ethical Disclaimer

*This system is a proof-of-concept for the Innov-AI-thon. It uses AI to provide fitness suggestions but is not a substitute for professional medical advice. The "Drill Sergeant" personality is designed to be aggressive for entertainment/motivation purposes only.*

---

**Made with ❤️ by Syntax Squad**
