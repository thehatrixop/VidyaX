from supabase import create_client
from dotenv import load_dotenv
import os
from pathlib import Path

# Load env file dynamically from backend root directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. "
        "Please add these environment variables in your Railway Project Dashboard under the 'Variables' tab."
    )

supabase = create_client(url, key)