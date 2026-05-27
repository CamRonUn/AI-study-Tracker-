from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")               # anon key — used for reads
service_key = os.getenv("SUPABASE_SERVICE_KEY")  # service role key — bypasses RLS for writes

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