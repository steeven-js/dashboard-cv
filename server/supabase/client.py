import os
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """
    Returns a configured Supabase client.

    Make sure SUPABASE_URL and SUPABASE_KEY environment variables are set.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")

    return create_client(url, key)
