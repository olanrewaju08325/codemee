from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.core.config import settings
from app.models.audit import ActivityLog
from app.models.system import PlatformSetting, EmailEvent
from app.models.ai import AIChatMessage, AIReviewUsage
from app.services.email_service import send_email_tracked, SMTP_HOST, SMTP_PORT, SMTP_USER
from app.services.ai_service import get_daily_limit, get_review_daily_limit

router = APIRouter(prefix="/api/admin/system", tags=["Admin Operations"])


@router.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    result = await db.execute(select(PlatformSetting).order_by(PlatformSetting.key))
    return [{"key": item.key, "value": item.value, "description": item.description} for item in result.scalars().all()]


@router.get("/audit")
async def get_audit_logs(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    result = await db.execute(select(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(100))
    return [
        {"id": str(item.id), "user_id": str(item.user_id), "role": item.role, "action": item.action,
         "target": item.target_object, "timestamp": item.timestamp}
        for item in result.scalars().all()
    ]


def _today_start() -> datetime:
    return datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)


@router.get("/usage")
async def get_usage(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    """Operational usage for the admin panel: AI (Groq) calls and SMTP email volume.

    Every section is guarded independently so a not-yet-applied migration (e.g.
    email_events) degrades to zeros instead of failing the whole panel.
    """
    start = _today_start()

    # ---- AI (Groq) usage — from tables that already exist ---------------------
    ai = {
        "provider": settings.AI_PROVIDER,
        "groq_keys_configured": len([k for k in settings.GROQ_API_KEYS.split(",") if k.strip()]),
        "chat_today": 0,
        "chat_total": 0,
        "review_today": 0,
        "review_total": 0,
        "active_users_today": 0,
        "daily_limit": settings.AI_DAILY_LIMIT,
        "review_daily_limit": settings.AI_REVIEW_DAILY_LIMIT,
        "available": True,
    }
    try:
        ai["daily_limit"] = await get_daily_limit(db)
        ai["review_daily_limit"] = await get_review_daily_limit(db)

        ai["chat_today"] = (await db.execute(
            select(func.count(AIChatMessage.id)).where(
                AIChatMessage.role == "user", AIChatMessage.created_at >= start
            )
        )).scalar() or 0
        ai["chat_total"] = (await db.execute(
            select(func.count(AIChatMessage.id)).where(AIChatMessage.role == "user")
        )).scalar() or 0
        ai["active_users_today"] = (await db.execute(
            select(func.count(func.distinct(AIChatMessage.user_id))).where(
                AIChatMessage.role == "user", AIChatMessage.created_at >= start
            )
        )).scalar() or 0
        ai["review_today"] = (await db.execute(
            select(func.count(AIReviewUsage.id)).where(AIReviewUsage.created_at >= start)
        )).scalar() or 0
        ai["review_total"] = (await db.execute(
            select(func.count(AIReviewUsage.id))
        )).scalar() or 0
    except Exception:
        ai["available"] = False

    # ---- SMTP / email usage — from email_events (migration 042) --------------
    smtp = {
        "configured": bool(SMTP_USER),
        "host": SMTP_HOST,
        "port": SMTP_PORT,
        "sent_today": 0,
        "failed_today": 0,
        "sent_total": 0,
        "failed_total": 0,
        "recent": [],
        "available": True,
    }
    try:
        smtp["sent_today"] = (await db.execute(
            select(func.count(EmailEvent.id)).where(EmailEvent.success.is_(True), EmailEvent.created_at >= start)
        )).scalar() or 0
        smtp["failed_today"] = (await db.execute(
            select(func.count(EmailEvent.id)).where(EmailEvent.success.is_(False), EmailEvent.created_at >= start)
        )).scalar() or 0
        smtp["sent_total"] = (await db.execute(
            select(func.count(EmailEvent.id)).where(EmailEvent.success.is_(True))
        )).scalar() or 0
        smtp["failed_total"] = (await db.execute(
            select(func.count(EmailEvent.id)).where(EmailEvent.success.is_(False))
        )).scalar() or 0
        recent_rows = (await db.execute(
            select(EmailEvent).order_by(EmailEvent.created_at.desc()).limit(15)
        )).scalars().all()
        smtp["recent"] = [
            {
                "to": r.to_email,
                "subject": r.subject,
                "category": r.category,
                "success": r.success,
                "error": r.error,
                "created_at": r.created_at,
            }
            for r in recent_rows
        ]
    except Exception:
        smtp["available"] = False

    return {"ai": ai, "smtp": smtp}


class TestEmailRequest(BaseModel):
    to_email: str


@router.post("/test-email")
async def test_email(
    request: TestEmailRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    delivered = await send_email_tracked(
        db,
        to_email=request.to_email,
        subject="CodeMe Academy - SMTP Test",
        body="Your CodeMe Academy SMTP configuration is working.",
        is_html=False,
        category="smtp_test",
    )
    if not delivered:
        raise HTTPException(status_code=502, detail="SMTP delivery failed")
    return {"success": True}
