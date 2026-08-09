from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_admin, require_teacher_or_admin
from app.schemas.payment import PaymentUpdate, PaymentResponse
from app.schemas.notification import NotificationCreate, NotificationUpdate
from app.schemas.profile import NotificationResponse
from app.schemas.admin import (
    AnalyticsResponse,
    GradeSubmissionRequest,
    FlagSubmissionRequest,
    ResetPasswordRequest,
    UpdateUserRoleRequest,
    StudentListItem,
    GradingQueueItem
)
from app.services.payment_service import get_all_payments_pending, update_payment_status
from app.services.notification_service import trigger_payment_reviewed, create_notification, get_all_notifications, update_notification, delete_notification
from app.services.admin_service import (
    get_admin_analytics,
    get_pending_grading,
    grade_submission,
    flag_submission,
    search_students,
    update_user_role,
    admin_reset_password
)

router = APIRouter()

@router.get("/admin/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    user_data: Dict[str, Any] = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get dashboard analytics for the admin portal.
    Replaces: AdminPortal.tsx lines 268-280
    """
    analytics = await get_admin_analytics(db)
    return analytics

@router.get("/admin/grading-queue", response_model=List[GradingQueueItem])
async def get_grading_queue(
    user_data: Dict[str, Any] = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all pending assignment submissions needing grading.
    Replaces: AdminPortal.tsx lines 282-286
    """
    queue = await get_pending_grading(db)
    return queue

@router.post("/admin/submissions/{submission_id}/grade", response_model=GradingQueueItem)
async def grade_submission_endpoint(
    submission_id: str,
    grade_data: GradeSubmissionRequest,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Grade an assignment submission (approve or reject).
    Replaces: AdminPortal.tsx lines 348-365
    """
    try:
        submission = await grade_submission(db, submission_id, grade_data, user_data["user_id"])
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    return submission

@router.patch("/admin/submissions/{submission_id}/flag")
async def flag_submission_endpoint(
    submission_id: str,
    flag_data: FlagSubmissionRequest,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Flag a submission as suspected AI (or clear the flag).
    Replaces: AdminPortal.tsx lines 185-193
    """
    submission = await flag_submission(db, submission_id, flag_data)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    return submission

@router.get("/admin/students", response_model=List[StudentListItem])
async def search_students_endpoint(
    q: str = Query("", description="Search query (name, email or student id)"),
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Search students by name, email or student id.
    Replaces: AdminPortal.tsx lines 464-477
    """
    if not q.strip():
        return []
    students = await search_students(db, q.strip())
    return students

@router.post("/admin/reset-password")
async def reset_password_endpoint(
    reset_data: ResetPasswordRequest,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Reset a student's password via the Supabase admin API.
    Replaces: AdminPortal.tsx lines 147-168
    """
    if not reset_data.new_password or len(reset_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    success = await admin_reset_password(reset_data.email, reset_data.new_password)
    return {"success": success}

@router.patch("/admin/profiles/{profile_id}/role")
async def update_user_role_endpoint(
    profile_id: str,
    role_data: UpdateUserRoleRequest,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Promote or demote a user's role.
    Replaces: AdminPortal.tsx lines 170-183
    """
    try:
        profile = await update_user_role(db, profile_id, role_data.role)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@router.get("/admin/payments/pending", response_model=List[PaymentResponse])
async def get_pending_payments(
    user_data: Dict[str, Any] = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all pending payment verifications.
    Replaces: AdminPortal.tsx lines 289-293
    """
    payments = await get_all_payments_pending(db)
    return payments

@router.patch("/admin/payments/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: str,
    payment_data: PaymentUpdate,
    user_data: Dict[str, Any] = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Approve or reject a payment verification.
    Replaces: AdminPortal.tsx lines 379-385, 403-411
    """
    payment = await update_payment_status(db, payment_id, payment_data)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    await trigger_payment_reviewed(db, payment.student_id, payment.id, payment_data.status, payment_data.rejection_reason)
    return payment

@router.post("/admin/notifications", response_model=NotificationResponse)
async def create_notification_endpoint(
    notification_data: NotificationCreate,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new notification for a user.
    """
    notification = await create_notification(db, notification_data)
    return notification

@router.get("/admin/notifications", response_model=List[NotificationResponse])
async def get_all_notifications_endpoint(
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all notifications (admin view).
    """
    notifications = await get_all_notifications(db)
    return notifications

@router.patch("/admin/notifications/{notification_id}", response_model=NotificationResponse)
async def update_notification_endpoint(
    notification_id: str,
    notification_data: NotificationUpdate,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a notification.
    """
    notification = await update_notification(db, notification_id, notification_data)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification

@router.delete("/admin/notifications/{notification_id}")
async def delete_notification_endpoint(
    notification_id: str,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a notification.
    """
    await delete_notification(db, notification_id)
    return {"status": "success", "message": "Notification deleted"}
