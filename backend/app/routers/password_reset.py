"""Public password-reset endpoints that bypass Supabase's built-in recovery
email (the source of the 500s). We email our own signed link via SMTP and set
the new password with the service-role key.

Both endpoints are deliberately email-enumeration-safe: forgot-password always
returns the same shape whether or not the account exists.
"""

import logging

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.admin_service import admin_reset_password
from app.services.password_reset_service import (
    send_password_reset_email,
    verify_reset_token,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Password Reset"])
limiter = Limiter(key_func=get_remote_address)


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
@limiter.limit("5/hour")
async def forgot_password(
    request: Request,
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Email a reset link through our own SMTP. Always reports success so an
    attacker can't use this to discover which emails have accounts. `delivered`
    tells the honest caller whether SMTP actually sent, so the UI can offer the
    WhatsApp/admin fallback when it didn't."""
    email = (data.email or "").strip().lower()
    delivered = False
    if "@" in email and len(email) <= 254:
        try:
            delivered = await send_password_reset_email(db, email)
        except Exception:  # never leak SMTP/internal errors to the client
            logger.exception("forgot-password send failed for %s", email)
            delivered = False

    return {
        "success": True,
        "delivered": delivered,
        "message": (
            "If an account exists for that email, a reset link is on its way."
        ),
    }


@router.post("/reset-password")
@limiter.limit("10/hour")
async def reset_password(
    request: Request,
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify our signed token and set the new password via the Supabase admin
    API. Generic errors so a bad/expired token can't be probed for detail."""
    if not data.new_password or len(data.new_password) < 6:
        return {"success": False, "error": "Password must be at least 6 characters long."}

    email = verify_reset_token(data.token)
    if not email:
        return {
            "success": False,
            "error": "This reset link is invalid or has expired. Please request a new one.",
        }

    try:
        changed = await admin_reset_password(email, data.new_password)
    except Exception:
        logger.exception("admin_reset_password failed for %s", email)
        changed = False

    if not changed:
        return {
            "success": False,
            "error": "We couldn't update the password right now. Please try again shortly or contact support.",
        }

    return {"success": True, "message": "Your password has been updated. You can now sign in."}
