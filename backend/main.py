from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents import FitCrew
from database.supabase_service import save_user_input, save_agent_logs, save_final_decision
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="The Council of Fit API")

# Enable CORS for frontend
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

@app.post("/api/consult_council")
async def consult_council(data: UserData):
    try:
        # Helper to convert to dict
        user_input_dict = data.model_dump()
        
        # Save input to DB
        saved_input = save_user_input(user_input_dict)
        input_id = saved_input['id'] if saved_input else None

        # Run Crew
        crew = FitCrew(user_input_dict)
        result = crew.run()
        
        # Parse Final Decision
        final_json_str = result['final_decision']
        # Note: LLM might return "```json ... ```". Need to clean.
        cleaned_json = final_json_str.replace("```json", "").replace("```", "").strip()
        
        try:
            decision_data = json.loads(cleaned_json)
        except:
            # Fallback if not pure JSON
            decision_data = {
                "final_plan": "Error parsing JSON",
                "duration_minutes": 0,
                "reasoning": final_json_str,
                "confidence_score": 0.0
            }

        if input_id:
            # Save Logs
            save_agent_logs(input_id, result['logs'])
            # Save Decision
            save_final_decision(input_id, decision_data)

        # Return result even if DB fails
        return {
            "decision": decision_data,
            "logs": result['logs']
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
