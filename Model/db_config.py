import os
from supabase import create_client, Client

# We keep the clients hidden as private global variables initially
_supabase_client = None
_supabase_admin_client = None

def get_supabase() -> Client:
    """Safely gets or creates the standard Supabase client."""
    global _supabase_client
    
    # If we already built it once, just return it instantly!
    if _supabase_client is not None:
        return _supabase_client
        
    # Otherwise, build it fresh, clean it, and save it
    url = os.environ.get("SUPABASE_URL", "").strip().strip("'").strip('"')
    key = os.environ.get("SUPABASE_KEY", "").strip().strip("'").strip('"')
    
    if not url or not key:
        raise ValueError("❌ Supabase URL or KEY environment variables are completely missing!")
        
    _supabase_client = create_client(url, key)
    return _supabase_client

def get_supabase_admin() -> Client:
    """Safely gets or creates the Admin Supabase client."""
    global _supabase_admin_client
    
    if _supabase_admin_client is not None:
        return _supabase_admin_client
        
    url = os.environ.get("SUPABASE_URL", "").strip().strip("'").strip('"')
    service_key = os.environ.get("SUPABASE_SERVICE_KEY", "").strip().strip("'").strip('"')
    
    if not service_key:
        print("⚠️ WARNING: SUPABASE_SERVICE_KEY not set — falling back to standard client.")
        return get_supabase()
        
    _supabase_admin_client = create_client(url, service_key)
    return _supabase_admin_client