import os
from supabase import create_client, Client

# 1. Private global placeholders (Start completely empty)
_supabase_client = None
_supabase_admin_client = None


def get_supabase() -> Client:
    """Safely gets or creates the standard Supabase client."""
    global _supabase_client
    
    # If already built, return it instantly
    if _supabase_client is not None:
        return _supabase_client
        
    # Fetch and CLEAN environment strings instantly upon request
    url = os.environ.get("SUPABASE_URL", "").strip().strip("'").strip('"')
    key = os.environ.get("SUPABASE_KEY", "").strip().strip("'").strip('"')
    
    if not url or not key:
        raise ValueError("❌ DEPLOYMENT CRASH: Supabase URL or KEY environment variables are completely missing!")
        
    print(f"🔄 Creating fresh standard Supabase client. Key length: {len(key)}")
    _supabase_client = create_client(url, key)
    return _supabase_client


def get_supabase_admin() -> Client:
    """Safely gets or creates the cached Admin Supabase client."""
    global _supabase_admin_client
    
    if _supabase_admin_client is not None:
        return _supabase_admin_client
        
    url = os.environ.get("SUPABASE_URL", "").strip().strip("'").strip('"')
    service_key = os.environ.get("SUPABASE_SERVICE_KEY", "").strip().strip("'").strip('"')
    
    if not service_key:
        print("⚠️ WARNING: SUPABASE_SERVICE_KEY not set — falling back to standard client.")
        return get_supabase()
        
    print(f"🔄 Creating fresh Admin Supabase client. Key length: {len(service_key)}")
    _supabase_admin_client = create_client(url, service_key)
    return _supabase_admin_client