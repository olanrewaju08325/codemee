from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.course import Course, Lesson, Module, StudentProgress
from app.models.enrollment import StudentEnrollment
from app.models.profile import Profile

router = APIRouter(prefix="/api/student/dashboard", tags=["Student Experience"])


@router.get("")
async def get_student_dashboard(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(["student"])),
):
    student_id = UUID(user["user_id"])
    profile = (await db.execute(select(Profile).where(Profile.id == student_id))).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    enrollments = (await db.execute(
        select(StudentEnrollment.course_id).where(
            StudentEnrollment.student_id == student_id,
            StudentEnrollment.status == "enrolled",
            StudentEnrollment.has_platform_access.is_(True),
        )
    )).scalars().all()
    completed_count = int((await db.execute(
        select(func.count(StudentProgress.id)).where(StudentProgress.student_id == student_id)
    )).scalar() or 0)

    next_lesson = None
    for course_id in enrollments:
        completed_lesson_ids = select(StudentProgress.lesson_id).where(StudentProgress.student_id == student_id)
        row = (await db.execute(
            select(Lesson, Course.title)
            .join(Module, Module.id == Lesson.module_id)
            .join(Course, Course.id == Module.course_id)
            .where(Module.course_id == course_id, Lesson.id.not_in(completed_lesson_ids))
            .order_by(Module.order_index, Lesson.order_index)
            .limit(1)
        )).first()
        if row:
            lesson, course_title = row
            next_lesson = {
                "lesson_id": str(lesson.id), "title": lesson.title, "course": course_title,
                "course_id": course_id, "estimated_duration": lesson.estimated_duration,
            }
            break

    return {
        "has_completed_onboarding": profile.has_completed_onboarding,
        "streak_count": profile.streak_count,
        "total_completed_lessons": completed_count,
        "next_recommended_lesson": next_lesson,
        "upcoming_deadlines": [],
        "overall_progress_percentage": None,
        "enrolled_course_ids": list(enrollments),
    }


@router.post("/onboarding/complete")
async def complete_onboarding(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(["student"])),
):
    profile = (await db.execute(
        select(Profile).where(Profile.id == UUID(user["user_id"])).with_for_update()
    )).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.has_completed_onboarding = True
    await db.commit()
    return {"status": "success"}
