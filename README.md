# 🏛️ The Council of Fit
### *An Agentic Fitness Arbitration System*

![Status](https://img.shields.io/badge/Status-Hackathon_Complete-success) ![Tech](https://img.shields.io/badge/AI-CrewAI_%7C_Gemini_1.5_Flash-blue) ![Tool](https://img.shields.io/badge/Tool-Google_Calendar_Integration-yellow)

---

## 1. 🔍 Problem Definition
**"Why do fitness apps fail?"** <br>
Most fitness apps are passive trackers. They show you data (e.g., "You slept 5 hours"), but they don't **act** on it.<br> 
Users are left to decide: *"Should I push through the fatigue or rest?"* This decision fatigue often leads to burnout or injury.

**The Solution:**<br>
**The Council of Fit** is an Agentic System that removes the burden of decision-making. Instead of a static algorithm, we simulate a **live debate** between opposing fitness philosophies:
* **The Drill Sergeant:** Prioritizes intensity and consistency.
* **The Zen Master:** Prioritizes recovery and longevity.
* **The Head Coach:** Arbitrates the debate and **executes** the final decision to your real-world calendar.

---

## 2. 🧠 Agentic Architecture

The system uses **CrewAI** to orchestrate a multi-agent workflow. We use a **"Simulated Debate" pattern** augmented by a **Long-Term Memory Module** (Supabase) to ensure decisions adapt to the user's history.

```text
+----------------+       +----------------------+       +-------------------------------+
|   User Input   | ----> |   Debate Moderator   | ----> | Drill Sergeant vs Zen Master  |
| (Sleep, Goals) |       | (Reads Past History) |       |      (Simulated Debate)       |
+----------------+       +----------^-----------+       +-------------------------------+
                                    |                                   |
                         +----------+----------+                        v
                         |   Supabase (Brain)  |                +----------------+
                         |  (Stores Past Logs) |                |   Head Coach   |
                         +---------------------+                |   (Arbiter)    |
                                                                +----------------+
                                                                        |
                                                ----------------------------------------
                                                |                                      |
                                                v                                      v
                                     +---------------------+                +--------------------+
                                     |   Google Calendar   |                |   React Frontend   |
                                     |   (Schedule Event)  |                | (Transparent Logs) |
                                     +---------------------+                +--------------------+

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

* **Orchestration:** CrewAI (Python) - Manages agent roles and task delegation.
* **LLM Engine:** Google Gemini Flash Latest (via LangChain) - chosen for its high speed and large context window.
* **Memory/Database:** Supabase - Acts as the system's "Brain," storing past decisions so agents can recall user history.
* **Backend:** FastAPI - Serves the agentic workflow as a REST API.
* **Frontend:** React + Vite - Displays the "live" debate transparency logs.
* **Tooling:** Google Calendar API - Allows the agents to perform real-world actions.

---

## 4. 🚀 Setup & Execution

### **Prerequisites**

* Python 3.10+
* Node.js 16+
* A Google Cloud Project with **Calendar API** enabled.
* A Supabase Project (for agent memory).

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
GOOGLE_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

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

1. **Contextual Memory (The Brain):** The system isn't amnesic. It queries **Supabase** to debug your past activity history. If you trained hard yesterday, the Zen Master adapts the argument to demand recovery today, while the Drill Sergeant pushes for consistency if you've been lazy.
2. **Transparency:** Unlike black-box models, the user sees *exactly* why a decision was made by reading the debate transcript.
3. **Conflict-Driven Reasoning:** By forcing agents to argue, we reduce hallucinations and ensure both safety (Zen) and progress (Drill) are considered.
4. **True Agency:** The system doesn't just suggest; it **schedules**. It modifies the user's environment via Google Calendar.

---

## 6. 💡 Design Philosophy (Why We Kept It Simple)

We intentionally chose a **Minimalist Agentic Architecture** over a traditional complex web app. Here is why:

### **Why no Multi-Page UI?**

* **Focus on Agency, Not Navigation:** Traditional apps force users to click through tabs (Diet, Workout, Profile). An **Agentic System** should be able to ingest context and act in a single interaction.
* **The "Council Chamber" Metaphor:** The UX is designed to simulate a meeting room. You don't leave the room to check your stats; the agents bring the data to *you*. A single-page view keeps the focus on the **Reasoning Process**.

### **Why no Authentication?**

* **Frictionless Demo:** Hackathon judges and users need to see value in **seconds**, not minutes. Forcing a login creates a barrier to entry.
* **Privacy by Design:** For this proof-of-concept, all sensitive health data is processed in-session and not permanently stored on a centralized server, reducing data liability.

### **Why are Agent Debate logs collapsible?**

* **Explainability on Demand:** A key challenge in AI is "Black Box" decision-making. We provide full transparency (the logs), but we collapse them by default to reduce **Cognitive Load**.
* **Trust Hierarchy:** The user first sees the **Action** (The Verdict). If they doubt the decision, they can expand the logs to audit the **Reasoning**. This balances usability with transparency.

---

## 7. ⚠️ Ethical Disclaimer

*This system is a proof-of-concept for the Innov-AI-thon. It uses AI to provide fitness suggestions but is not a substitute for professional medical advice. The "Drill Sergeant" personality is designed to be aggressive for entertainment/motivation purposes only.*

---

**Made with ❤️ by Syntax Squad**
