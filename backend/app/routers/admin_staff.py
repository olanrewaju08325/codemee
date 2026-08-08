from typing import Any, Dict
from urllib.parse import quote

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.permissions import require_admin

router = APIRouter(prefix="/api/admin/staff", tags=["Admin Staff"])

class TeacherInvite(BaseModel):
    email: str

@router.post("/invite-teacher")
async def invite_teacher(data: TeacherInvite, user: Dict[str, Any] = Depends(require_admin)):
    if "@" not in data.email or len(data.email) > 254:
        raise HTTPException(status_code=422, detail="A valid teacher email is required")
    if not settings.SUPABASE_SERVICE_ROLE_KEY or not settings.FRONTEND_URL:
        raise HTTPException(status_code=503, detail="Teacher invitations require SUPABASE_SERVICE_ROLE_KEY and FRONTEND_URL on the backend")
    redirect_to = f"{settings.FRONTEND_URL.rstrip('/')}/#/auth"
    try:
        response = requests.post(
            f"{settings.SUPABASE_PROJECT_URL.rstrip('/')}/auth/v1/invite?redirect_to={quote(redirect_to, safe=':/#')}",
            json={"email": data.email},
            headers={"Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}", "apikey": settings.SUPABASE_SERVICE_ROLE_KEY}, timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Could not send the teacher invitation")
    return {"success": True, "message": "Teacher invitation sent. Assign the teacher to courses after they accept."}
