import asyncio
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

# We need a mock user or token. The app uses require_role.
# We can override the dependency!
from app.core.security import require_role

def override_require_role(allowed_roles: list[str]):
    def dependency():
        return {"user_id": "00000000-0000-0000-0000-000000000001", "role": allowed_roles[0]}
    return dependency

app.dependency_overrides[require_role(["student"])] = override_require_role(["student"])
app.dependency_overrides[require_role(["student", "admin", "teacher"])] = override_require_role(["student"])

print("Testing /api/student/dashboard")
res = client.get("/api/student/dashboard")
print(res.status_code)
print(res.text)

print("Testing /api/gamification/stats")
res = client.get("/api/gamification/stats")
print(res.status_code)
print(res.text)

print("Testing /api/live-classes/upcoming")
res = client.get("/api/live-classes/upcoming")
print(res.status_code)
print(res.text)

print("Testing /api/announcements/latest")
res = client.get("/api/announcements/latest")
print(res.status_code)
print(res.text)
