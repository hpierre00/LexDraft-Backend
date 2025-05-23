# app/models/database.py
from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables first!
load_dotenv()  # Add this line

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)