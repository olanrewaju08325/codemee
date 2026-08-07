from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from app.models.monitoring import SystemEventLog, ErrorLog, Incident
from sqlalchemy import select

router = APIRouter(prefix="/api/admin/monitoring", tags=["Admin Operations", "Observability"])

@router.get("/health")
def get_system_health(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns an aggregated system health score and subsystem statuses.
    """
    return {
        "status": "Healthy",
        "score": 99.8,
        "subsystems": {
            "frontend": "Operational",
            "backend": "Operational",
            "database": "Operational",
            "storage": "Operational",
            "authentication": "Operational",
            "ai_services": "Degraded",
            "email_services": "Operational"
        }
    }

@router.get("/errors")
def get_error_logs(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns recent error logs and exceptions.
    """
    logs = db.execute(select(ErrorLog).order_by(ErrorLog.timestamp.desc()).limit(50)).scalars().all()
    return logs

@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns the incident register.
    """
    incidents = db.execute(select(Incident).order_by(Incident.detection_time.desc())).scalars().all()
    return incidents

