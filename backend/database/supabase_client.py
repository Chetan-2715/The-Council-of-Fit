import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Load .env from root (backend/database/../.. -> root)
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")

if not url or not key:
    print(f"Warning: Supabase credentials not found in {env_path}")

supabase: Client = create_client(url, key)
