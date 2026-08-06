from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_teacher_or_admin, require_admin
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIChatMessageResponse,
    AIReviewResponse,
    AIConfirmReviewRequest,
    AISettingsResponse,
    AISettingsUpdate,
)
from app.services.ai_service import (
    ask_tutor,
    get_chat_history,
    draft_review,
    confirm_review,
    get_pending_reviews,
    get_ai_settings,
    update_ai_settings,
)

router = APIRouter()


@router.post("/ai/ask", response_model=AIChatResponse)
async def ai_ask(
    data: AIChatRequest,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Student AI tutor chat. Hint-only; enforces the per-user daily cap."""
    return await ask_tutor(db, user_data["user_id"], data.message, data.context_code)


@router.get("/ai/chat/history", response_model=list[AIChatMessageResponse])
async def ai_chat_history(
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Chat history for the current user."""
    return await get_chat_history(db, user_data["user_id"])


@router.get("/ai/reviews/pending", response_model=list[AIReviewResponse])
async def ai_pending_reviews(
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Draft AI reviews waiting for a teacher to edit/confirm."""
    return await get_pending_reviews(db)


@router.post("/ai/review-submission/{submission_id}", response_model=AIReviewResponse)
async def ai_review_submission(
    submission_id: str,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Generate a draft AI review for a submission (does not apply it)."""
    try:
        review = await draft_review(db, submission_id, user_data["user_id"])
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e),
        )
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )
    return review


@router.post("/ai/confirm-review/{submission_id}", response_model=AIReviewResponse)
async def ai_confirm_review(
    submission_id: str,
    data: AIConfirmReviewRequest,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Apply the teacher-edited AI review and release the grade to the student."""
    try:
        review = await confirm_review(db, submission_id, user_data["user_id"], data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found for this submission",
        )
    return review


@router.get("/ai/settings", response_model=AISettingsResponse)
async def ai_get_settings(
    user_data: Dict[str, Any] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin view of AI configuration."""
    return await get_ai_settings(db)


@router.patch("/ai/settings", response_model=AISettingsResponse)
async def ai_update_settings(
    data: AISettingsUpdate,
    user_data: Dict[str, Any] = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin-adjustable AI daily caps (chat + review generation)."""
    return await update_ai_settings(db, data)
