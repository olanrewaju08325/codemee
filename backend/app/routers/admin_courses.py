from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.course import Course

router = APIRouter(prefix="/api/admin/courses", tags=["Admin Operations"])


@router.get("/")
async def get_courses(
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    result = await db.execute(select(Course).order_by(Course.title))
    return [{"id": item.id, "title": item.title, "status": item.status} for item in result.scalars().all()]
