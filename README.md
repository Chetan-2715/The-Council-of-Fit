# The Council of Fit

**Agentic Fitness System powered by CrewAI and Gemini.**

## 🎯 System Goal
A multi-agent system where conflicting philosophies (Performance vs. Recovery) debate to reach a consensus on your daily workout, executing the final decision directly to your Google Calendar.

## 🧠 Architecture

The system consists of three main agents:
1.  **Drill Sergeant (Performance)**: Maximizes intensity.
2.  **Zen Master (Recovery)**: Prioritizes health and rest.
3.  **Head Coach (Arbiter)**: Makes the final decision and updates the calendar.

## 🛠 Tech Stack
-   **Orchestration**: CrewAI
-   **LLM**: Gemini API (Free Tier)
-   **Backend**: Python (FastAPI)
-   **Frontend**: React (Vite)
-   **Database**: PostgreSQL
-   **Tools**: Google Calendar API

## 🚀 Setup Instructions

### 1. Prerequisites
-   Python 3.10+
-   Node.js 18+
-   PostgreSQL installed and running
-   Google Cloud Console Project with Calendar API enabled (credentials.json)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
-   `GOOGLE_API_KEY`: For Gemini.
-   `SUPABASE_URL`: Your Supabase Project URL.
-   `SUPABASE_ANON_KEY`: Your Supabase Anon Public Key.
-   `GOOGLE_CALENDAR_CREDENTIALS`: Path to your credentials JSON.

### 4. Database Setup (Supabase)

1.  Create a new Supabase Project.
2.  Go to the **SQL Editor** and run the following script to create the required tables:

```sql
-- User Inputs Table
create table user_inputs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  age int,
  goal text,
  sleep_hours float,
  stress_level text,
  soreness text,
  available_time_minutes int
);

-- Agent Logs Table
create table agent_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  input_id uuid references user_inputs(id),
  agent_name text,
  content text
);

-- Decisions Table
create table decisions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  input_id uuid references user_inputs(id),
  final_plan text,
  duration_minutes int,
  reasoning text,
  confidence_score float
);
```
3.  Ensure Row Level Security (RLS) policies allow insertion if you have RLS enabled (or disable RLS for this demo).

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 6. Usage
1.  Open the web UI.
2.  Enter your daily stats (Sleep, Stress, Soreness, Time).
3.  Watch the agents debate in real-time.
4.  See the final verdict and check your Google Calendar!

## ⚠️ Disclaimer
This system provides fitness suggestions based on AI logic. It is not a medical device. Always consult a physician before starting a new fitness regime.
