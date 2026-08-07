from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from app.models.course import Course
from sqlalchemy import select

router = APIRouter(prefix="/api/admin/courses", tags=["Admin Operations"])

@router.get("/")
def get_courses(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns a list of all courses for admin management.
    """
    courses = db.execute(select(Course)).scalars().all()
    return [{"id": str(c.id), "title": c.title, "status": c.status} for c in courses]

