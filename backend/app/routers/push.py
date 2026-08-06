from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select
from typing import Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.push import PushSubscription
from app.schemas.push import PushSubscriptionCreate
import uuid

router = APIRouter()

@router.post("/push/subscribe")
async def subscribe(
    subscription_data: PushSubscriptionCreate,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Register or refresh a Web Push subscription for the current user.
    Replaces: supabase.from('push_subscriptions').insert(...)
    """
    if not subscription_data.endpoint:
        raise HTTPException(status_code=400, detail="endpoint is required")

    user_id = uuid.UUID(user_data["user_id"])
    result = await db.execute(
        select(PushSubscription).where(
            PushSubscription.user_id == user_id,
            PushSubscription.endpoint == subscription_data.endpoint
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.p256dh = subscription_data.keys.p256dh
        existing.auth = subscription_data.keys.auth
    else:
        db.add(
            PushSubscription(
                user_id=user_id,
                endpoint=subscription_data.endpoint,
                p256dh=subscription_data.keys.p256dh,
                auth=subscription_data.keys.auth,
            )
        )
    await db.commit()
    return {"status": "success", "subscribed": True}

@router.post("/push/unsubscribe")
async def unsubscribe(
    subscription_data: PushSubscriptionCreate,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a Web Push subscription for the current user.
    """
    await db.execute(
        delete(PushSubscription).where(
            PushSubscription.user_id == uuid.UUID(user_data["user_id"]),
            PushSubscription.endpoint == subscription_data.endpoint
        )
    )
    await db.commit()
    return {"status": "success", "subscribed": False}
