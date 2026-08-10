import urllib.request
import urllib.parse
import json
import random
import time

base_url = "https://codemee-backend.onrender.com/api"

# We cannot easily register because supabase is used for auth.
# Wait, auth is handled by Supabase! The backend doesn't register users directly in Supabase, the frontend does.
# If I don't have a Supabase JWT, I can't hit the backend authenticated endpoints.
# BUT I can fetch the PUBLIC announcements endpoint if it exists? No, announcements are authenticated.

# Wait, what if there's another endpoint that throws 500 without auth?
# /api/courses ?
