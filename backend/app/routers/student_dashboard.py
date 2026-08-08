from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from app.database import get_db
from app.core.security import require_role
from app.models.profile import Profile
from app.models.course import StudentProgress, Course, Module, Lesson
from app.models.enrollment import StudentEnrollment
import time

router = APIRouter(prefix="/api/student/dashboard", tags=["Student Experience"])

@router.get("/")
def get_student_dashboard(db: Session = Depends(get_db), user=Depends(require_role(["student"]))):
    """
    Returns aggregated dashboard data for the authenticated student.
    """
    profile = db.execute(select(Profile).where(Profile.id == user.id)).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    # Calculate completed lessons
    completed_lessons = db.execute(
        select(StudentProgress).where(StudentProgress.student_id == user.id)
    ).scalars().all()
    
    # 1. Fetch Student's active enrollments
    enrollments = db.execute(
        select(StudentEnrollment).where(
            and_(StudentEnrollment.student_id == user.id, StudentEnrollment.status == "enrolled")
        )
    ).scalars().all()
    
    next_recommended_lesson = None
    
    # 2. Iterate through enrollments to find the next logical lesson
    for enrollment in enrollments:
        # Get course
        course = db.execute(select(Course).where(Course.id == enrollment.course_id)).scalar_one_or_none()
        if not course:
            continue
            
        # Get all completed lesson IDs for this student in this course
        # We need a join to filter by course
        completed_lessons = db.execute(
            select(StudentProgress.lesson_id)
            .join(Lesson, Lesson.id == StudentProgress.lesson_id)
            .join(Module, Module.id == Lesson.module_id)
            .where(
                and_(
                    StudentProgress.student_id == user.id,
                    Module.course_id == course.id
                )
            )
        ).scalars().all()
        
        # Get all lessons for this course ordered by module order, then lesson order
        all_lessons = db.execute(
            select(Lesson)
            .join(Module, Module.id == Lesson.module_id)
            .where(Module.course_id == course.id)
            .order_by(Module.order_index.asc(), Lesson.order_index.asc())
        ).scalars().all()
        
        # Find the first lesson that is NOT in completed_lessons
        for lesson in all_lessons:
            if lesson.id not in completed_lessons:
                next_recommended_lesson = {
                    "lesson_id": str(lesson.id),
                    "title": lesson.title,
                    "course": course.title,
                    "course_id": course.id,
                    "estimated_duration": lesson.estimated_duration
                }
                break
                
        if next_recommended_lesson:
            break # Found one to recommend, we can stop checking other courses for now

    return {
        "has_completed_onboarding": profile.has_completed_onboarding,
        "streak_count": profile.streak_count,
        "total_completed_lessons": len(completed_lessons),
        "next_recommended_lesson": next_recommended_lesson,
        "upcoming_deadlines": [],
        "overall_progress_percentage": min(100, len(completed_lessons) * 5) # Mock for visual testing
    }

@router.post("/onboarding/complete")
def complete_onboarding(db: Session = Depends(get_db), user=Depends(require_role(["student"]))):
    profile = db.execute(select(Profile).where(Profile.id == user.id)).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
        
    profile.has_completed_onboarding = True
    db.commit()
    return {"status": "success"}

