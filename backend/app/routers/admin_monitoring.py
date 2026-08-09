from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.monitoring import ErrorLog, Incident

router = APIRouter(prefix="/api/admin/monitoring", tags=["Admin Operations", "Observability"])


@router.get("/health")
async def get_system_health(_user=Depends(require_role(["admin"]))):
    """Static service descriptor; infrastructure health is available from /api/health."""
    return {"status": "See /api/health for live infrastructure status"}


@router.get("/errors")
async def get_error_logs(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    result = await db.execute(select(ErrorLog).order_by(ErrorLog.timestamp.desc()).limit(50))
    return result.scalars().all()


@router.get("/incidents")
async def get_incidents(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    result = await db.execute(select(Incident).order_by(Incident.detection_time.desc()).limit(50))
    return result.scalars().all()
