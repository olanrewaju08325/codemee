from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.batch import Batch

router = APIRouter(prefix="/api/admin/batches", tags=["Admin Batches"])


class BatchCreate(BaseModel):
    name: str
    course_id: str
    instructor_id: Optional[str] = None
    status: str = "planned"


@router.get("/")
async def get_batches(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    result = await db.execute(select(Batch).order_by(Batch.created_at.desc()))
    return [
        {"id": str(item.id), "name": item.name, "course_id": item.course_id,
         "instructor_id": str(item.instructor_id) if item.instructor_id else None,
         "start_date": item.start_date, "end_date": item.end_date, "status": item.status}
        for item in result.scalars().all()
    ]


@router.post("/")
async def create_batch(
    request: BatchCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    if request.status not in {"planned", "active", "completed", "cancelled"}:
        raise HTTPException(status_code=422, detail="Invalid batch status")
    batch = Batch(
        name=request.name.strip(), course_id=request.course_id,
        instructor_id=UUID(request.instructor_id) if request.instructor_id else None,
        status=request.status,
    )
    db.add(batch)
    await db.commit()
    await db.refresh(batch)
    return {"id": str(batch.id), "name": batch.name}
