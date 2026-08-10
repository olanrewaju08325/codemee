from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.profile import Profile
from app.services.admin_service import admin_delete_user, admin_create_user
from pydantic import BaseModel, EmailStr

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

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str

@router.post("/")
async def create_user(
    request: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    if request.role not in ("student", "teacher", "admin"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user_id = await admin_create_user(request.email, request.password, request.full_name)
    if not user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Could not create user in auth system")
        
    # User Profile is created by Supabase Auth webhook, but we need to update the role!
    # Wait, the webhook might take a second. Let's just create or update the profile here.
    # It's better to update it since the webhook inserts it with default 'student' role.
    import asyncio
    await asyncio.sleep(1) # wait for webhook
    
    from sqlalchemy import update
    await db.execute(update(Profile).where(Profile.id == user_id).values(role=request.role))
    await db.commit()
    
    return {"id": user_id, "message": "User created successfully"}

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    success = await admin_delete_user(user_id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Failed to delete user in auth system")
        
    # Also delete the profile just to be safe if cascade doesn't happen
    from sqlalchemy import delete
    await db.execute(delete(Profile).where(Profile.id == user_id))
    await db.commit()
    
    return {"message": "User deleted successfully"}
