from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agents import FitCrew
from database.supabase_service import (
    save_user_input, 
    save_agent_logs, 
    save_final_decision, 
    fetch_recent_decisions # <--- IMPORT THE BRAIN FETCH
)
import json
import uvicorn
import re
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="The Council of Fit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserData(BaseModel):
    age: int
    goal: str
    sleep_hours: float
    stress_level: str
    soreness: str
    available_time_minutes: int

# --- 🧠 SUPABASE BRAIN LOGIC ---
def get_memory_context():
    """Fetches the last 3 decisions from Supabase to give agents context."""
    decisions = fetch_recent_decisions(limit=3)
    
    if not decisions:
        return "No previous history. This is the first session."
    
    # Format the DB rows into a string the Agents can read
    summary = []
    for d in decisions:
        # Extract date (e.g., 2023-10-25) and Plan
        date_str = d.get('created_at', '').split('T')[0] 
        plan = d.get('final_plan', 'Unknown Plan')
        summary.append(f"- {date_str}: {plan}")
    
    return "\n".join(summary)
# -------------------------------

@app.post("/api/consult_council")
async def consult_council(data: UserData):
    try:
        user_input_dict = data.model_dump()
        
        # 1. INJECT MEMORY FROM SUPABASE
        # The agents now read from your real database!
        user_input_dict['history'] = get_memory_context()
        
        # 2. Run the Agent Crew
        crew = FitCrew(user_input_dict)
        result = crew.run()
        
        # 3. Extract JSON
        final_text = result['final_decision']
        decision_data = {}
        
        try:
            json_match = re.search(r"\{.*\}", final_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                decision_data = json.loads(json_str)
            else:
                raise ValueError("No JSON object found")
        except Exception as e:
            print(f"JSON Parse Error: {e}")
            decision_data = {
                "final_plan": "Consultation Complete (Parse Error)",
                "duration_minutes": 0,
                "reasoning": "The Council debated, but the format was invalid.",
                "confidence_score": 0.0
            }

        # 4. SAVE TO SUPABASE (This updates the Brain for next time)
        try:
            saved_input = save_user_input(user_input_dict)
            if saved_input:
                save_agent_logs(saved_input['id'], result['logs'])
                save_final_decision(saved_input['id'], decision_data)
        except Exception as db_err:
            print(f"Database Error: {db_err}")

        return {
            "decision": decision_data,
            "logs": result['logs']
        }

    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)