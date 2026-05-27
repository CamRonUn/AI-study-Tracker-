from supabase import create_client, Client
from dotenv import load_dotenv
import os

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
service_key = os.environ.get("SUPABASE_SERVICE_KEY")

# 🚨 THE SAFETY CHECK: Print debug info to Render logs to see exactly what is missing
if not url or not key:
    print(f"❌ DEPLOYMENT ERROR: Missing keys! URL present: {bool(url)}, Key present: {bool(key)}")
    # Clean up any accidental whitespace or quote bugs if they managed to sneak into the strings
    if url: url = url.strip().strip("'").strip('"')
    if key: key = key.strip().strip("'").strip('"') # service role key — bypasses RLS for writes

supabase: Client = create_client(url, key)

# Use this client for any insert/update/delete that hits RLS-protected tables
# (users_Courses, quiz_results, calendar_events)
# Get your service role key from: Supabase dashboard -> Project Settings -> API -> service_role
if service_key:
    supabase_admin: Client = create_client(url, service_key)
else:
    # Fallback to anon client if service key not set (will still hit RLS errors)
    print("WARNING: SUPABASE_SERVICE_KEY not set — writes may fail due to RLS policies")
    supabase_admin = supabase