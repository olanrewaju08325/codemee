from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.audit import ActivityLog
from app.models.system import PlatformSetting
from app.services.email_service import send_email

router = APIRouter(prefix="/api/admin/system", tags=["Admin Operations"])


@router.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    result = await db.execute(select(PlatformSetting).order_by(PlatformSetting.key))
    return [{"key": item.key, "value": item.value, "description": item.description} for item in result.scalars().all()]


@router.get("/audit")
async def get_audit_logs(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    result = await db.execute(select(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(100))
    return [
        {"id": str(item.id), "user_id": str(item.user_id), "role": item.role, "action": item.action,
         "target": item.target_object, "timestamp": item.timestamp}
        for item in result.scalars().all()
    ]


class TestEmailRequest(BaseModel):
    to_email: str


@router.post("/test-email")
async def test_email(request: TestEmailRequest, _user=Depends(require_role(["admin"]))):
    try:
        delivered = send_email(
            to_email=request.to_email,
            subject="CodeMe Academy - SMTP Test",
            body="Your CodeMe Academy SMTP configuration is working.",
            is_html=False,
        )
        if not delivered:
            raise RuntimeError("SMTP did not accept the message")
    except Exception as exc:
        raise HTTPException(status_code=502, detail="SMTP delivery failed") from exc
    return {"success": True}
