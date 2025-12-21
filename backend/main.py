from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agents import FitCrew
from database.supabase_service import save_user_input, save_agent_logs, save_final_decision
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

@app.post("/api/consult_council")
async def consult_council(data: UserData):
    try:
        user_input_dict = data.model_dump()
        
        # 1. Run the Crew
        crew = FitCrew(user_input_dict)
        result = crew.run()
        
        # 2. Robust JSON Extraction
        final_text = result['final_decision']
        decision_data = {}
        
        try:
            # Find the JSON object inside the text using Regex
            json_match =KP = re.search(r"\{.*\}", final_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                decision_data = json.loads(json_str)
            else:
                raise ValueError("No JSON found")
        except Exception as e:
            print(f"JSON Parse Error: {e}")
            # Fallback if AI fails
            decision_data = {
                "final_plan": "Consultation Complete",
                "duration_minutes": 0,
                "reasoning": final_text[:100] + "...",
                "confidence_score": 0.0
            }

        # 3. Save to DB (Optional)
        saved_input = save_user_input(user_input_dict)
        if saved_input:
            save_agent_logs(saved_input['id'], result['logs'])
            save_final_decision(saved_input['id'], decision_data)

        return {
            "decision": decision_data,
            "logs": result['logs']
        }

    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)