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

