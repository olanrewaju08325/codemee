from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.profile import Profile

router = APIRouter(prefix="/api/admin/users", tags=["Admin Operations"])


@router.get("/")
async def get_users(
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    result = await db.execute(select(Profile).order_by(Profile.created_at.desc()))
    return [
        {"id": str(item.id), "full_name": item.full_name, "role": item.role, "email": item.email}
        for item in result.scalars().all()
    ]
