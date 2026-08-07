from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

from app.database import get_db
from app.dependencies import get_current_user, require_teacher_or_admin, require_admin
from app.models.profile import Profile, UserRole
from app.schemas.analytics import StudentAnalyticsResponse, TeacherAnalyticsResponse, AdminAnalyticsResponse
from app.services.analytics_service import get_student_analytics, get_teacher_analytics, get_admin_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/student/me", response_model=StudentAnalyticsResponse)
def read_student_analytics(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.STUDENT and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized for student analytics")
    return get_student_analytics(db, current_user.id)


@router.get("/teacher/me", response_model=TeacherAnalyticsResponse)
def read_teacher_analytics(
    current_user: Profile = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    return get_teacher_analytics(db, current_user.id)


@router.get("/admin/overview", response_model=AdminAnalyticsResponse)
def read_admin_analytics(
    current_user: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_admin_analytics(db)


@router.get("/export")
def export_analytics(
    type: str = Query(..., description="Type of export: students, revenue, ai"),
    current_user: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Simple CSV export generation
    output = StringIO()
    writer = csv.writer(output)

    if type == "revenue":
        writer.writerow(["Metric", "Value"])
        stats = get_admin_analytics(db)
        writer.writerow(["Total Revenue", stats['financial_dashboard']['total_revenue']])
        writer.writerow(["Pending Payments", stats['financial_dashboard']['pending_payments']])
        writer.writerow(["Approved Transactions", stats['financial_dashboard']['approved_transactions']])
    elif type == "students":
        writer.writerow(["Total Enrolled", "New This Month"])
        stats = get_admin_analytics(db)
        writer.writerow([stats['platform_overview']['active_enrollments'], stats['enrollment_analytics']['new_this_month']])
    else:
        raise HTTPException(status_code=400, detail="Invalid export type")

    output.seek(0)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=analytics_export_{type}.csv"
    return response
