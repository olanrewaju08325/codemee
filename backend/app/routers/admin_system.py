from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from app.models.system import PlatformSetting
from app.models.audit import ActivityLog
from sqlalchemy import select

router = APIRouter(prefix="/api/admin/system", tags=["Admin Operations"])

@router.get("/settings")
def get_settings(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns platform settings.
    """
    settings = db.execute(select(PlatformSetting)).scalars().all()
    return [{"key": s.key, "value": s.value, "description": s.description} for s in settings]

@router.get("/audit")
def get_audit_logs(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns the immutable audit logs.
    """
    logs = db.execute(select(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(100)).scalars().all()
    return [{"id": str(l.id), "user_id": str(l.user_id), "role": l.role, "action": l.action, "target": l.target_object, "timestamp": l.timestamp} for l in logs]

from pydantic import BaseModel
from fastapi import HTTPException
from app.services.email_service import send_email

class TestEmailRequest(BaseModel):
    to_email: str

@router.post("/test-email")
def test_email(req: TestEmailRequest, db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    try:
        send_email(
            to_email=req.to_email,
            subject="CodeMe Academy - SMTP Test",
            body="If you are seeing this, your SMTP configuration is successfully wired into the Render backend!",
            is_html=False
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
