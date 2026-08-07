"""AI Tutor orchestration: chat with persistence, daily caps, review drafts."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from typing import Optional, List
from datetime import datetime
import uuid

from app.core.config import settings
from app.models.ai import AIChatMessage, AIReview, AIReviewUsage, AISetting
from app.models.course import AssignmentSubmission, Assignment
from app.models.profile import Profile
from app.schemas.ai import (
    AIChatResponse,
    AIChatMessageResponse,
    AIReviewResponse,
    AIConfirmReviewRequest,
    AISettingsResponse,
    AISettingsUpdate,
)
from app.services.ai_provider import get_ai_provider
from app.services.notification_service import trigger_assignment_graded

DAILY_LIMIT_KEY = "daily_limit"
REVIEW_DAILY_LIMIT_KEY = "review_daily_limit"


async def get_daily_limit(db: AsyncSession) -> int:
    result = await db.execute(select(AISetting).where(AISetting.key == DAILY_LIMIT_KEY))
    row = result.scalar_one_or_none()
    if row:
        try:
            return max(1, int(row.value))
        except (TypeError, ValueError):
            pass
    return settings.AI_DAILY_LIMIT


async def get_review_daily_limit(db: AsyncSession) -> int:
    result = await db.execute(select(AISetting).where(AISetting.key == REVIEW_DAILY_LIMIT_KEY))
    row = result.scalar_one_or_none()
    if row:
        try:
            return max(1, int(row.value))
        except (TypeError, ValueError):
            pass
    return settings.AI_REVIEW_DAILY_LIMIT


async def get_ai_settings(db: AsyncSession) -> AISettingsResponse:
    return AISettingsResponse(
        daily_limit=await get_daily_limit(db),
        review_daily_limit=await get_review_daily_limit(db),
        provider=settings.AI_PROVIDER,
    )


async def update_ai_settings(db: AsyncSession, data: AISettingsUpdate) -> AISettingsResponse:
    for key, value in ((DAILY_LIMIT_KEY, data.daily_limit), (REVIEW_DAILY_LIMIT_KEY, data.review_daily_limit)):
        normalized = max(1, int(value))
        result = await db.execute(select(AISetting).where(AISetting.key == key))
        row = result.scalar_one_or_none()
        if row:
            row.value = str(normalized)
        else:
            db.add(AISetting(key=key, value=str(normalized)))
    await db.commit()
    return await get_ai_settings(db)


async def count_usage_today(db: AsyncSession, user_id: str) -> int:
    start = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.count(AIChatMessage.id)).where(
            AIChatMessage.user_id == uuid.UUID(user_id),
            AIChatMessage.role == "user",
            AIChatMessage.created_at >= start,
        )
    )
    return result.scalar() or 0


async def count_review_usage_today(db: AsyncSession, teacher_id: str) -> int:
    start = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.count(AIReviewUsage.id)).where(
            AIReviewUsage.user_id == uuid.UUID(teacher_id),
            AIReviewUsage.created_at >= start,
        )
    )
    return result.scalar() or 0


async def ask_tutor(
    db: AsyncSession,
    user_id: str,
    message: str,
    context_code: Optional[str] = None,
) -> AIChatResponse:
    provider = get_ai_provider(settings.AI_PROVIDER)
    limit = await get_daily_limit(db)
    used = await count_usage_today(db, user_id)

    if used >= limit:
        return AIChatResponse(
            reply=(
                f"You've reached today's hint limit ({limit} questions). "
                "Ask again tomorrow, or reach out to your instructor for help."
            ),
            remaining=0,
            daily_limit=limit,
            provider=provider.name,
        )

    db.add(
        AIChatMessage(
            user_id=uuid.UUID(user_id),
            role="user",
            content=message,
            context_code=context_code,
        )
    )
    await db.commit()

    reply = await provider.ask_tutor(message, context_code or "")
    db.add(AIChatMessage(user_id=uuid.UUID(user_id), role="assistant", content=reply))
    await db.commit()

    return AIChatResponse(
        reply=reply,
        remaining=max(0, limit - used - 1),
        daily_limit=limit,
        provider=provider.name,
    )


async def get_chat_history(db: AsyncSession, user_id: str, limit: int = 100) -> List[AIChatMessageResponse]:
    result = await db.execute(
        select(AIChatMessage)
        .where(AIChatMessage.user_id == uuid.UUID(user_id))
        .order_by(AIChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = list(result.scalars().all())
    messages.reverse()
    return [
        AIChatMessageResponse(id=str(m.id), role=m.role, content=m.content, created_at=m.created_at)
        for m in messages
    ]


async def draft_review(
    db: AsyncSession,
    submission_id: str,
    teacher_id: str,
) -> Optional[AIReviewResponse]:
    """Generate (or regenerate) a draft AI review for a submission. Not applied to the submission."""
    result = await db.execute(
        select(AssignmentSubmission, Assignment, Profile)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .join(Profile, AssignmentSubmission.student_id == Profile.id)
        .where(AssignmentSubmission.id == submission_id)
    )
    row = result.first()
    if not row:
        return None
    sub, assignment, profile = row

    limit = await get_review_daily_limit(db)
    used = await count_review_usage_today(db, teacher_id)
    if used >= limit:
        raise ValueError(
            f"You've reached today's AI review-generation limit ({limit} reviews). "
            "Try again tomorrow."
        )

    db.add(AIReviewUsage(user_id=uuid.UUID(teacher_id)))
    await db.commit()

    provider = get_ai_provider(settings.AI_PROVIDER)
    draft = await provider.draft_submission_review(sub.submission_text or "", assignment.title)

    existing_result = await db.execute(select(AIReview).where(AIReview.submission_id == submission_id))
    existing = existing_result.scalar_one_or_none()

    if existing:
        existing.feedback = draft["feedback"]
        existing.score = draft["score"]
        existing.is_ai_flagged = bool(draft.get("is_ai_flagged"))
        existing.status = "draft"
        existing.created_by = uuid.UUID(teacher_id)
        existing.confirmed_by = None
        existing.confirmed_at = None
        await db.commit()
        review = existing
    else:
        review = AIReview(
            submission_id=uuid.UUID(submission_id),
            feedback=draft["feedback"],
            score=draft["score"],
            is_ai_flagged=bool(draft.get("is_ai_flagged")),
            status="draft",
            created_by=uuid.UUID(teacher_id),
        )
        db.add(review)
        await db.commit()
        await db.refresh(review)

    return AIReviewResponse(
        id=str(review.id),
        submission_id=str(review.submission_id),
        feedback=review.feedback,
        score=review.score,
        is_ai_flagged=review.is_ai_flagged,
        status=review.status,
        created_at=review.created_at,
        assignment_title=assignment.title,
        student_name=profile.full_name,
    )


async def confirm_review(
    db: AsyncSession,
    submission_id: str,
    teacher_id: str,
    data: AIConfirmReviewRequest,
) -> Optional[AIReviewResponse]:
    """Apply the (editable) AI review to the submission and release the grade."""
    if data.status not in ("approved", "rejected"):
        raise ValueError("Status must be 'approved' or 'rejected'")

    result = await db.execute(
        select(AssignmentSubmission, AIReview)
        .join(AIReview, AIReview.submission_id == AssignmentSubmission.id)
        .where(AssignmentSubmission.id == submission_id)
        .where(AIReview.id == data.review_id)
    )
    row = result.first()
    if not row:
        return None
    sub, review = row

    await db.execute(
        update(AssignmentSubmission)
        .where(AssignmentSubmission.id == submission_id)
        .values(
            status=data.status,
            feedback=data.feedback,
            graded_by=uuid.UUID(teacher_id),
            graded_at=datetime.now().astimezone(),
        )
    )
    await db.execute(
        update(AIReview)
        .where(AIReview.id == data.review_id)
        .values(
            feedback=data.feedback,
            status="confirmed",
            confirmed_by=uuid.UUID(teacher_id),
            confirmed_at=datetime.now().astimezone(),
            is_ai_flagged=data.is_ai_flagged,
        )
    )
    await db.commit()

    await trigger_assignment_graded(db, str(sub.student_id), submission_id, data.status)

    return AIReviewResponse(
        id=str(review.id),
        submission_id=str(review.submission_id),
        feedback=data.feedback,
        score=review.score,
        is_ai_flagged=data.is_ai_flagged,
        status="confirmed",
        created_at=review.created_at,
    )


async def get_pending_reviews(db: AsyncSession) -> List[AIReviewResponse]:
    result = await db.execute(
        select(AIReview, Assignment, Profile)
        .join(AssignmentSubmission, AssignmentSubmission.id == AIReview.submission_id)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .join(Profile, AssignmentSubmission.student_id == Profile.id)
        .where(AIReview.status == "draft")
        .order_by(AIReview.created_at.desc())
    )
    rows = result.all()

    return [
        AIReviewResponse(
            id=str(r.id),
            submission_id=str(r.submission_id),
            feedback=r.feedback,
            score=r.score,
            is_ai_flagged=r.is_ai_flagged,
            status=r.status,
            created_at=r.created_at,
            assignment_title=assignment.title,
            student_name=profile.full_name,
        )
        for r, assignment, profile in rows
    ]

async def generate_content(db: AsyncSession, prompt: str, context_type: str, context_data: Optional[str] = None) -> str:
    """Generate content for teachers/admins without touching daily review/chat limits."""
    provider = get_ai_provider(settings.AI_PROVIDER)
    return await provider.generate_content(prompt, context_type, context_data)
