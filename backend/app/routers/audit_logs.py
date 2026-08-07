from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.audit_log import AdminAuditLog
from app.schemas.audit_log import AuditLogResponse
from app.core.security import require_role

router = APIRouter(prefix="/api/admin/audit-logs", tags=["Audit Logs"])

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    user=Depends(require_role(["admin"]))
):
    """
    Super Admins can view the immutable audit logs.
    """
    return db.query(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(100).all()

def create_audit_log(
    db: Session,
    admin_id: str,
    action: str,
    target_object: str = None,
    admin_name: str = None,
    ip_address: str = None,
    details: str = None
):
    """
    Helper function to safely inject audit logs.
    """
    log = AdminAuditLog(
        admin_id=admin_id,
        action=action,
        target_object=target_object,
        admin_name=admin_name,
        ip_address=ip_address,
        details=details
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

