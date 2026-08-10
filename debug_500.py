import urllib.request
import urllib.parse
import json
import base64
import hmac
import hashlib
import time

def b64_encode(data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.urlsafe_b64encode(data).replace(b'=', b'').decode('ascii')

def mint_jwt(payload, secret):
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = b64_encode(json.dumps(header))
    payload_b64 = b64_encode(json.dumps(payload))
    message = f"{header_b64}.{payload_b64}".encode('ascii')
    signature = hmac.new(secret.encode('utf-8'), message, hashlib.sha256).digest()
    sig_b64 = b64_encode(signature)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

supabase_url = "https://lnrchirwppzgjbndmegl.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucmNoaXJ3cHB6Z2pibmRtZWdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ3Njc3MiwiZXhwIjoyMDk4MDUyNzcyfQ.rRjNkKXqE43N2Bl8hDmBlY_G0yu9Anp4YBTRcPsHYNo"

req = urllib.request.Request(
    f"{supabase_url}/rest/v1/profiles?select=id,role&limit=1",
    headers={"apikey": service_key, "Authorization": f"Bearer {service_key}"}
)
try:
    with urllib.request.urlopen(req) as response:
        profiles = json.loads(response.read().decode())
        user_id = profiles[0]["id"]
except Exception as e:
    print(f"Error fetching profile: {e}")
    exit(1)

secret = "8WDM+KMpbQJd9+QIQVKtD9JI6QI1t73qL2fDF+beX5ambLfREP7zUgsKC6sXMeef42KjwUv5ayCR1hkhQF84vw=="
payload = {
    "sub": user_id,
    "role": "authenticated",
    "aud": "authenticated",
    "exp": int(time.time()) + 3600
}
token = mint_jwt(payload, secret)

endpoints = [
    "/api/student/dashboard",
    "/api/live-classes/upcoming?limit=5",
    "/api/gamification/stats",
    "/api/announcements/latest"
]

for ep in endpoints:
    print(f"\nCalling {ep}...")
    req = urllib.request.Request(
        f"https://codemee-backend.onrender.com{ep}",
        headers={"Authorization": f"Bearer {token}"}
    )
    try:
        with urllib.request.urlopen(req) as response:
            print("Status:", response.status)
            print(response.read().decode())
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code)
        print(e.read().decode())
