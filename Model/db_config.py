import os
from supabase import create_client, Client

# 1. Fetch values directly from Render
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
service_key = os.environ.get("SUPABASE_SERVICE_KEY")

# 2. CLEAN THEM IMMEDIATELY (Before validation or creation)
if url: 
    url = url.strip().strip("'").strip('"')
if key: 
    key = key.strip().strip("'").strip('"')
if service_key: 
    service_key = service_key.strip().strip("'").strip('"')

# 3. Explicitly crash with a helpful message if they are completely missing
if not url or not key:
    raise ValueError(f"❌ DEPLOYMENT CRASH: Keys completely missing! URL present: {bool(url)}, Key present: {bool(key)}")

# 4. Initialize clients safely
print(f"🔄 Attempting to initialize Supabase with key length: {len(key)}")
supabase: Client = create_client(url, key)

if service_key:
    print(f"🔄 Attempting to initialize Supabase Admin with key length: {len(service_key)}")
    supabase_admin: Client = create_client(url, service_key)
else:
    print("⚠️ WARNING: SUPABASE_SERVICE_KEY not set — falling back to standard client.")
    supabase_admin = supabase