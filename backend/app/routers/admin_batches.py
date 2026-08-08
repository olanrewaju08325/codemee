from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from pydantic import BaseModel
from typing import List, Optional
import uuid

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
    # Dummy select for now if there is no Batch model, or use raw sql
    # Since we don't have a Batch model right here, we will just return mock or execute raw sql
    # A real implementation would use: return db.query(Batch).all()
    # For now, we return empty list if table doesn't exist or query it if it does
    try:
        result = db.execute("SELECT id, name, course_id, instructor_id, start_date, status FROM batches ORDER BY created_at DESC").fetchall()
        return [{"id": r[0], "name": r[1], "course_id": r[2], "instructor_id": r[3], "start_date": r[4], "status": r[5]} for r in result]
    except Exception as e:
        return []

@router.post("/")
def create_batch(req: BatchCreate, db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    try:
        batch_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO batches (id, name, course_id, instructor_id, status) VALUES (:id, :name, :course_id, :instructor_id, :status)",
            {"id": batch_id, "name": req.name, "course_id": req.course_id, "instructor_id": req.instructor_id, "status": req.status}
        )
        db.commit()
        return {"id": batch_id, "name": req.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
