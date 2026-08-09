from typing import Any, Dict
from urllib.parse import quote

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.permissions import require_admin

router = APIRouter(prefix="/api/admin/staff", tags=["Admin Staff"])

class TeacherInvite(BaseModel):
    email: str

@router.post("/invite-teacher")
async def invite_teacher(
    data: TeacherInvite,
    user: Dict[str, Any] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if "@" not in data.email or len(data.email) > 254:
        raise HTTPException(status_code=422, detail="A valid teacher email is required")
    if not settings.SUPABASE_SERVICE_ROLE_KEY or not settings.FRONTEND_URL:
        raise HTTPException(status_code=503, detail="Teacher invitations require SUPABASE_SERVICE_ROLE_KEY and FRONTEND_URL on the backend")
    redirect_to = f"{settings.FRONTEND_URL.rstrip('/')}/#/auth"
    email = data.email.strip().lower()
    await db.execute(
        text("""
            INSERT INTO teacher_invitations (email, invited_by)
            VALUES (:email, :invited_by)
            ON CONFLICT (email) DO UPDATE SET invited_by = EXCLUDED.invited_by, invited_at = now(), accepted_at = NULL
        """),
        {"email": email, "invited_by": user["user_id"]},
    )
    await db.commit()
    try:
        response = requests.post(
            f"{settings.SUPABASE_PROJECT_URL.rstrip('/')}/auth/v1/invite?redirect_to={quote(redirect_to, safe=':/#')}",
            json={"email": email},
            headers={"Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}", "apikey": settings.SUPABASE_SERVICE_ROLE_KEY}, timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException:
        await db.execute(text("DELETE FROM teacher_invitations WHERE email = :email"), {"email": email})
        await db.commit()
        raise HTTPException(status_code=502, detail="Could not send the teacher invitation")
    return {"success": True, "message": "Teacher invitation sent. The accepted account will become a Teacher; assign courses after acceptance."}
