from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.audit_log import AdminAuditLog
from app.schemas.audit_log import AuditLogResponse

router = APIRouter(prefix="/api/admin/audit-logs", tags=["Audit Logs"])


@router.get("/", response_model=List[AuditLogResponse])
async def get_audit_logs(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    result = await db.execute(select(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(100))
    return result.scalars().all()


async def create_audit_log(
    db: AsyncSession,
    admin_id: str,
    action: str,
    target_object: str | None = None,
    admin_name: str | None = None,
    ip_address: str | None = None,
    details: str | None = None,
) -> AdminAuditLog:
    """Append an audit event; callers commit their own business transaction."""
    log = AdminAuditLog(
        admin_id=admin_id,
        action=action,
        target_object=target_object,
        admin_name=admin_name,
        ip_address=ip_address,
        details=details,
    )
    db.add(log)
    await db.flush()
    return log
