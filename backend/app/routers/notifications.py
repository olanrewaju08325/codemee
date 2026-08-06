from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.push import NotificationPreference
from app.schemas.push import PushPreferencesResponse, PushPreferencesUpdate
import uuid

router = APIRouter()

PREFERENCE_FIELDS = [
    "email_notifications",
    "push_notifications",
    "mute_assignments",
    "mute_grades",
    "mute_live",
    "mute_announcements",
    "mute_certificates",
]

def _preference_response(pref: NotificationPreference) -> PushPreferencesResponse:
    return PushPreferencesResponse(
        email_notifications=pref.email_notifications,
        push_notifications=pref.push_notifications,
        mute_assignments=pref.mute_assignments,
        mute_grades=pref.mute_grades,
        mute_live=pref.mute_live,
        mute_announcements=pref.mute_announcements,
        mute_certificates=pref.mute_certificates,
    )

@router.get("/notifications/preferences", response_model=PushPreferencesResponse)
async def get_notification_preferences(
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current user's notification preferences (email/push toggles + mutes).
    """
    user_id = uuid.UUID(user_data["user_id"])
    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == user_id)
    )
    pref = result.scalar_one_or_none()
    if not pref:
        pref = NotificationPreference(user_id=user_id)
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return _preference_response(pref)

@router.patch("/notifications/preferences", response_model=PushPreferencesResponse)
async def update_notification_preferences(
    updates: PushPreferencesUpdate,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the current user's notification preferences.
    """
    user_id = uuid.UUID(user_data["user_id"])
    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == user_id)
    )
    pref = result.scalar_one_or_none()
    if not pref:
        pref = NotificationPreference(user_id=user_id)
        db.add(pref)

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in PREFERENCE_FIELDS:
            setattr(pref, field, value)

    await db.commit()
    await db.refresh(pref)
    return _preference_response(pref)
