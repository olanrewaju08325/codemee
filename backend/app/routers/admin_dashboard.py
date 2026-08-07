from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role

router = APIRouter(prefix="/api/admin/dashboard", tags=["Admin Operations"])

@router.get("/")
def get_admin_dashboard(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns executive overview telemetry for the admin dashboard.
    """
    return {
        "total_students": 1500,
        "active_students": 1200,
        "teachers": 45,
        "courses": 12,
        "active_batches": 2,
        "pending_manual_payments": 8,
        "revenue_summary": 45000,
        "database_health": "Healthy",
        "deployment_status": "Stable"
    }

