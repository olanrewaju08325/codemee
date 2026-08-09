from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role

router = APIRouter(prefix="/api/teacher/dashboard", tags=["Teacher Operations"])


@router.get("/")
async def get_teacher_dashboard(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(["teacher", "admin"])),
):
    """Return real, course-scoped figures and no invented class-size metrics."""
    course_rows = (await db.execute(
        text("SELECT c.id, c.title FROM courses c JOIN course_teachers ct ON ct.course_id = c.id WHERE ct.teacher_id = :teacher_id ORDER BY c.title"),
        {"teacher_id": user["user_id"]},
    )).mappings().all()
    course_ids = [row["id"] for row in course_rows]
    total_students = 0
    pending_grading = 0
    if course_ids:
        total_students = int((await db.execute(
            text("SELECT count(*) FROM student_enrollments WHERE course_id = ANY(:course_ids) AND status = 'enrolled'"),
            {"course_ids": course_ids},
        )).scalar() or 0)
        pending_grading = int((await db.execute(
            text("""SELECT count(*) FROM assignment_submissions s
                  JOIN assignments a ON a.id = s.assignment_id
                  JOIN modules m ON m.id = a.module_id
                  WHERE m.course_id = ANY(:course_ids) AND s.status = 'pending'"""),
            {"course_ids": course_ids},
        )).scalar() or 0)
    return {
        "assigned_courses": [dict(row) for row in course_rows],
        "assigned_courses_count": len(course_rows),
        "total_enrolled_students": total_students,
        "pending_grading_count": pending_grading,
    }
