from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.commerce import Invoice, PaymentSubmission
from app.models.course import Course
from app.models.enrollment import StudentEnrollment
from app.models.profile import Profile, UserRole


router = APIRouter(prefix="/api/admin/dashboard", tags=["Admin Operations"])


@router.get("/")
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    """Return real academy metrics; no placeholder revenue or deployment claims."""
    async def count(statement):
        return int((await db.execute(statement)).scalar() or 0)

    total_students = await count(select(func.count(Profile.id)).where(Profile.role == UserRole.STUDENT))
    total_teachers = await count(select(func.count(Profile.id)).where(Profile.role == UserRole.TEACHER))
    total_courses = await count(select(func.count(Course.id)))
    active_enrollments = await count(
        select(func.count(StudentEnrollment.id)).where(StudentEnrollment.status == "enrolled")
    )
    pending_manual_payments = await count(
        select(func.count(PaymentSubmission.id)).where(PaymentSubmission.status == "submitted")
    )
    revenue = (await db.execute(
        select(func.coalesce(func.sum(Invoice.amount_due), 0)).where(Invoice.status == "paid")
    )).scalar() or 0

    return {
        "total_students": total_students,
        "active_students": active_enrollments,
        "teachers": total_teachers,
        "courses": total_courses,
        "pending_manual_payments": pending_manual_payments,
        "revenue_summary": float(revenue),
    }
