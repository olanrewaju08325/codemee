"""Public, unauthenticated config the frontend needs before a user signs in.

Currently just the support contact details shown on the forgot-password screen
when an automated reset email can't be delivered.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.managed_settings import get_support_contact

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/support-contact")
async def support_contact(db: AsyncSession = Depends(get_db)):
    """Return {whatsapp, email} the student can use to reach the admin."""
    return await get_support_contact(db)
