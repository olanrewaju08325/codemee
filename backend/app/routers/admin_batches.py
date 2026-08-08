from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from pydantic import BaseModel
from typing import List, Optional
import uuid
from sqlalchemy import select
from app.models.batch import Batch
from app.routers.audit_logs import create_audit_log

router = APIRouter(prefix="/api/admin/batches", tags=["Admin Batches"])

class BatchCreate(BaseModel):
    name: str
    course_id: str
    instructor_id: Optional[str] = None
    status: str = "upcoming"

class BatchUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

@router.get("/")
def get_batches(db: Session = Depends(get_db), user=Depends(require_role(["admin", "teacher"]))):
    try:
        batches = db.execute(select(Batch).order_by(Batch.created_at.desc())).scalars().all()
        return [{"id": str(b.id), "name": b.name, "course_id": b.course_id, "instructor_id": str(b.instructor_id) if b.instructor_id else None, "start_date": b.start_date, "status": b.status} for b in batches]
    except Exception as e:
        return []

@router.post("/")
def create_batch(req: BatchCreate, db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    try:
        new_batch = Batch(
            name=req.name,
            course_id=req.course_id,
            instructor_id=req.instructor_id,
            status=req.status
        )
        db.add(new_batch)
        db.commit()
        db.refresh(new_batch)
        
        # Log action
        create_audit_log(
            db=db,
            admin_id=user["user_id"],
            action="CREATE_BATCH",
            target_object=str(new_batch.id),
            admin_name=user.get("email"),
            details=f"Created batch {new_batch.name} for course {new_batch.course_id}"
        )
        return {"id": str(new_batch.id), "name": new_batch.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
