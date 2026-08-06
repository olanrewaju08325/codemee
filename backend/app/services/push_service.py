"""Web Push delivery via the Web Push API (RFC 8030) using pywebpush.

Pushes are dispatched as asyncio background tasks so notification-trigger
requests stay fast even when fanning out to many subscribers (announcements).
Each task opens its own DB session, so it never touches the request session.
"""
import asyncio
import json
import logging
from typing import Any, Dict, Iterable, List, Optional

from sqlalchemy import delete, select
from pywebpush import WebPushException, webpush

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.push import NotificationPreference, PushSubscription

logger = logging.getLogger(__name__)

# Maps a notification category to its mute column on notification_preferences.
# Exam results are grades, so "exam" reuses mute_grades.
CATEGORY_MUTE_FIELD = {
    "assignment": "mute_assignments",
    "grade": "mute_grades",
    "exam": "mute_grades",
    "live_class": "mute_live",
    "certificate": "mute_certificates",
    "announcement": "mute_announcements",
}

VAPID_TTL_SECONDS = 86400


def _deliver(subscription: PushSubscription, payload: str) -> Optional[int]:
    """Send a single push message. Returns the HTTP status code, or None."""
    if not settings.VAPID_PRIVATE_KEY:
        logger.warning("VAPID_PRIVATE_KEY not configured; skipping push delivery")
        return None
    if not subscription.endpoint or not subscription.p256dh or not subscription.auth:
        logger.warning("Push subscription missing keys; skipping: %s", subscription.endpoint)
        return None

    try:
        response = webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth,
                },
            },
            data=payload,
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": settings.VAPID_SUBJECT},
            ttl=VAPID_TTL_SECONDS,
            timeout=15,
        )
        return response.status_code
    except WebPushException as exc:
        if exc.response is not None and exc.response.status_code in (404, 410):
            logger.info(
                "Push subscription expired (%s); will clean up: %s",
                exc.response.status_code,
                subscription.endpoint,
            )
            return exc.response.status_code
        logger.warning("Web push delivery failed: %s", exc)
        return None
    except Exception as exc:  # network timeouts etc.
        logger.warning("Web push delivery error: %s", exc)
        return None


async def _get_deliverable_subscriptions(
    user_ids: Iterable[str], category: str
) -> List[PushSubscription]:
    """Return subscriptions the given users can receive pushes on right now."""
    user_ids = list(dict.fromkeys(user_ids))
    if not user_ids:
        return []

    async with AsyncSessionLocal() as session:
        prefs_result = await session.execute(
            select(NotificationPreference).where(
                NotificationPreference.user_id.in_(user_ids)
            )
        )
        prefs = {p.user_id: p for p in prefs_result.scalars().all()}

        subs_result = await session.execute(
            select(PushSubscription).where(PushSubscription.user_id.in_(user_ids))
        )
        subscriptions = subs_result.scalars().all()

    mute_field = CATEGORY_MUTE_FIELD.get(category)
    deliverable = []
    for sub in subscriptions:
        pref = prefs.get(sub.user_id)
        if pref is not None:
            if not pref.push_notifications:
                continue
            if mute_field and getattr(pref, mute_field, False):
                continue
        deliverable.append(sub)
    return deliverable


async def _send_to_subscriptions(
    subscriptions: List[PushSubscription],
    title: str,
    body: str,
    data: Dict[str, Any],
) -> None:
    if not subscriptions:
        return

    payload = json.dumps(
        {
            "title": title,
            "body": body,
            "url": data.get("url", "/"),
            "tag": data.get("tag", "codeme-notification"),
        }
    )

    expired_ids = []
    for sub in subscriptions:
        status = await asyncio.to_thread(_deliver, sub, payload)
        if status in (404, 410):
            expired_ids.append(sub.id)

    if expired_ids:
        async with AsyncSessionLocal() as session:
            await session.execute(
                delete(PushSubscription).where(PushSubscription.id.in_(expired_ids))
            )
            await session.commit()


async def _run_push(
    user_ids: List[str],
    title: str,
    body: str,
    data: Dict[str, Any],
    category: str,
) -> None:
    try:
        subscriptions = await _get_deliverable_subscriptions(user_ids, category)
        await _send_to_subscriptions(subscriptions, title, body, data)
    except Exception:
        logger.exception("Background web push task failed")


def queue_push(
    user_id: str,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None,
    category: str = "announcement",
) -> None:
    """Queue a push to a single user (returns immediately)."""
    asyncio.create_task(
        _run_push([user_id], title, body, data or {}, category)
    )


def queue_push_many(
    user_ids: Iterable[str],
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None,
    category: str = "announcement",
) -> None:
    """Queue a push to many users (returns immediately)."""
    asyncio.create_task(
        _run_push(list(user_ids), title, body, data or {}, category)
    )
