from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from app.models.profile import Profile
from sqlalchemy import select

router = APIRouter(prefix="/api/admin/users", tags=["Admin Operations"])

@router.get("/")
def get_users(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns a list of all users for admin management.
    """
    users = db.execute(select(Profile)).scalars().all()
    return [{"id": str(u.id), "full_name": u.full_name, "role": u.role, "email": u.email} for u in users]

