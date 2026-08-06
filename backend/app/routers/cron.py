from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.services.reminder_service import send_live_class_reminders, send_exam_reminders
from app.services.notification_service import cleanup_old_notifications

router = APIRouter()

@router.post("/cron/live-class-reminders")
async def live_class_reminders(
    x_cron_secret: str = Header(default=""),
    db: AsyncSession = Depends(get_db)
):
    """
    Internal endpoint for scheduled live-class reminders.
    Call every ~5 minutes with header `X-Cron-Secret: <CRON_SECRET>`.
    Reminds enrolled students about classes starting within the next 15 minutes.
    """
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    reminded = await send_live_class_reminders(db)
    return {"status": "success", "reminded": reminded}

@router.post("/cron/exam-reminders")
async def exam_reminders(
    x_cron_secret: str = Header(default=""),
    db: AsyncSession = Depends(get_db)
):
    """
    Internal endpoint for scheduled exam reminders.
    Call every ~6 hours with header `X-Cron-Secret: <CRON_SECRET>`.
    Reminds enrolled students about exams starting within the next 24 hours.
    """
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    reminded = await send_exam_reminders(db)
    return {"status": "success", "reminded": reminded}

@router.post("/cron/cleanup-notifications")
async def cleanup_notifications(
    x_cron_secret: str = Header(default=""),
    db: AsyncSession = Depends(get_db)
):
    """
    Internal endpoint for notification TTL cleanup.
    Call daily with header `X-Cron-Secret: <CRON_SECRET>`.
    Deletes notifications older than 30 days.
    """
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    deleted = await cleanup_old_notifications(db)
    return {"status": "success", "deleted": deleted}
