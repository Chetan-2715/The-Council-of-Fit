from database.supabase_client import supabase
import datetime

def save_user_input(data: dict):
    """Saves user stats to Supabase and returns the created record."""
    try:
        response = supabase.table('user_inputs').insert(data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving user input: {e}")
        return None

def save_agent_logs(input_id: str, logs: list):
    """Saves a batch of agent logs."""
    try:
        records = []
        for log in logs:
            records.append({
                "input_id": input_id,
                # FIXED: Removed 'step' which caused errors, just use agent name
                "agent_name": log.get('agent', 'Unknown Agent'), 
                "content": log.get('content', '')
            })
        
        if records:
            response = supabase.table('agent_logs').insert(records).execute()
            return response.data
        return []
    except Exception as e:
        print(f"Error saving agent logs: {e}")
        return []

def save_final_decision(input_id: str, decision_data: dict):
    """Saves the final verdict."""
    try:
        record = {
            "input_id": input_id,
            "final_plan": decision_data.get('final_plan', 'Unknown'),
            "duration_minutes": decision_data.get('duration_minutes', 0),
            "reasoning": decision_data.get('reasoning', ''),
            "confidence_score": decision_data.get('confidence_score', 0.0)
        }
        response = supabase.table('decisions').insert(record).execute()
        return response.data
    except Exception as e:
        print(f"Error saving decision: {e}")
        return None

def fetch_recent_decisions(limit=3):
    """Fetches recent decisions for the Brain."""
    try:
        # Fetch the last 3 decisions to give context
        response = supabase.table('decisions').select("*").order('created_at', desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching decisions: {e}")
        return []