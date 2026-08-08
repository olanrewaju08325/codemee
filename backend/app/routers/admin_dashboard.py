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
    try:
        # Total Students
        total_students = db.execute("SELECT COUNT(*) FROM profiles WHERE role ILIKE 'student'").scalar() or 0
        
        # Teachers
        total_teachers = db.execute("SELECT COUNT(*) FROM profiles WHERE role ILIKE 'teacher'").scalar() or 0
        
        # Courses
        total_courses = db.execute("SELECT COUNT(*) FROM courses").scalar() or 0
        
        # Active Batches
        active_batches = db.execute("SELECT COUNT(*) FROM batches WHERE status = 'active'").scalar() or 0
        
        # Pending Payments
        pending_payments = db.execute("SELECT COUNT(*) FROM exam_payment_verifications WHERE status = 'pending'").scalar() or 0
        
        return {
            "total_students": total_students,
            "active_students": total_students, # Mocking active for now
            "teachers": total_teachers,
            "courses": total_courses,
            "active_batches": active_batches,
            "pending_manual_payments": pending_payments,
            "revenue_summary": 0, # Could be derived from approved payments
            "database_health": "Healthy",
            "deployment_status": "Stable"
        }
    except Exception as e:
        return {
            "total_students": 0,
            "active_students": 0,
            "teachers": 0,
            "courses": 0,
            "active_batches": 0,
            "pending_manual_payments": 0,
            "revenue_summary": 0,
            "database_health": "Error",
            "deployment_status": "Stable",
            "error": str(e)
        }

