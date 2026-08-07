from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from app.database import get_db
from app.core.security import require_role
from app.models.profile import Profile
from app.models.course import StudentProgress
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
    
    # Mocking complex schedule calculations since the dataset is pending volume
    next_recommended_lesson = {
        "title": "Introduction to Next.js API Routes",
        "course": "Full Stack Mastery",
        "estimated_duration": 45
    }

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

