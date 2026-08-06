from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, or_
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
import urllib.request
import urllib.error

from app.core.config import settings
from app.models.profile import Profile
from app.models.enrollment import StudentEnrollment
from app.models.payment import ExamPaymentVerification
from app.models.course import Assignment, AssignmentSubmission, Module
from app.schemas.admin import (
    AnalyticsResponse,
    GradeSubmissionRequest,
    FlagSubmissionRequest,
    StudentListItem,
    GradingQueueItem
)
from app.services.notification_service import trigger_assignment_graded

async def get_admin_analytics(db: AsyncSession) -> AnalyticsResponse:
    """Compute dashboard metrics for the admin portal."""
    total_students = await db.execute(
        select(func.count(Profile.id)).where(Profile.role == "student")
    )
    total = total_students.scalar() or 0

    active_wd101 = await db.execute(
        select(func.count(StudentEnrollment.id))
        .where(StudentEnrollment.course_id == "wd101")
        .where(StudentEnrollment.status == "enrolled")
    )
    active = active_wd101.scalar() or 0

    pending_payments = await db.execute(
        select(func.count(ExamPaymentVerification.id))
        .where(ExamPaymentVerification.status == "pending")
    )
    pending_pay = pending_payments.scalar() or 0

    pending_grading = await db.execute(
        select(func.count(AssignmentSubmission.id))
        .where(AssignmentSubmission.status == "pending")
    )
    pending_grade = pending_grading.scalar() or 0

    return AnalyticsResponse(
        total_students=total,
        active_wd101=active,
        pending_payments=pending_pay,
        pending_grading=pending_grade
    )

async def get_pending_grading(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get all pending assignment submissions with student and assignment info."""
    result = await db.execute(
        select(AssignmentSubmission, Profile, Assignment, Module)
        .join(Profile, AssignmentSubmission.student_id == Profile.id)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .join(Module, Assignment.module_id == Module.id)
        .where(AssignmentSubmission.status == "pending")
        .order_by(AssignmentSubmission.created_at.asc())
    )
    rows = result.all()

    items = []
    for sub, profile, assignment, module in rows:
        items.append({
            "id": str(sub.id),
            "assignment_id": str(sub.assignment_id),
            "student_id": str(sub.student_id),
            "submission_text": sub.submission_text,
            "submission_file": sub.submission_file,
            "status": sub.status,
            "feedback": sub.feedback,
            "graded_by": str(sub.graded_by) if sub.graded_by else None,
            "graded_at": sub.graded_at,
            "created_at": sub.created_at,
            "is_ai_flagged": sub.is_ai_flagged,
            "profiles": {
                "full_name": profile.full_name,
                "student_id": profile.student_id,
                "email": profile.email,
                "role": profile.role,
            },
            "assignments": {
                "id": str(assignment.id),
                "title": assignment.title,
                "module_id": str(assignment.module_id),
                "modules": {
                    "id": str(module.id),
                    "title": module.title,
                    "order_index": module.order_index,
                },
            },
        })

    return items

async def grade_submission(
    db: AsyncSession,
    submission_id: str,
    grade_data: GradeSubmissionRequest,
    graded_by: str
) -> Optional[Dict[str, Any]]:
    """Grade an assignment submission (approve or reject)."""
    if grade_data.status not in ("approved", "rejected"):
        raise ValueError("Status must be 'approved' or 'rejected'")

    result = await db.execute(
        select(AssignmentSubmission).where(AssignmentSubmission.id == submission_id)
    )
    sub = result.scalar_one_or_none()
    if not sub:
        return None

    await db.execute(
        update(AssignmentSubmission)
        .where(AssignmentSubmission.id == submission_id)
        .values(
            status=grade_data.status,
            feedback=grade_data.feedback,
            graded_by=graded_by,
            graded_at=datetime.now()
        )
    )
    await db.commit()

    await trigger_assignment_graded(db, sub.student_id, sub.id, grade_data.status)

    result = await db.execute(
        select(AssignmentSubmission, Profile, Assignment, Module)
        .join(Profile, AssignmentSubmission.student_id == Profile.id)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .join(Module, Assignment.module_id == Module.id)
        .where(AssignmentSubmission.id == submission_id)
    )
    row = result.first()
    if not row:
        return None

    sub, profile, assignment, module = row
    return {
        "id": str(sub.id),
        "assignment_id": str(sub.assignment_id),
        "student_id": str(sub.student_id),
        "submission_text": sub.submission_text,
        "submission_file": sub.submission_file,
        "status": sub.status,
        "feedback": sub.feedback,
        "graded_by": str(sub.graded_by) if sub.graded_by else None,
        "graded_at": sub.graded_at,
        "created_at": sub.created_at,
        "is_ai_flagged": sub.is_ai_flagged,
        "profiles": {
            "full_name": profile.full_name,
            "student_id": profile.student_id,
            "email": profile.email,
            "role": profile.role,
        },
        "assignments": {
            "id": str(assignment.id),
            "title": assignment.title,
            "module_id": str(assignment.module_id),
            "modules": {
                "id": str(module.id),
                "title": module.title,
                "order_index": module.order_index,
            },
        },
    }

async def flag_submission(
    db: AsyncSession,
    submission_id: str,
    flag_data: FlagSubmissionRequest
) -> Optional[Dict[str, Any]]:
    """Mark a submission as suspected AI (or clear the flag)."""
    result = await db.execute(
        select(AssignmentSubmission).where(AssignmentSubmission.id == submission_id)
    )
    sub = result.scalar_one_or_none()
    if not sub:
        return None

    await db.execute(
        update(AssignmentSubmission)
        .where(AssignmentSubmission.id == submission_id)
        .values(is_ai_flagged=flag_data.is_ai_flagged)
    )
    await db.commit()

    return {"id": submission_id, "is_ai_flagged": flag_data.is_ai_flagged}

async def search_students(db: AsyncSession, query: str) -> List[StudentListItem]:
    """Search students by name, email or student id."""
    pattern = f"%{query}%"
    result = await db.execute(
        select(Profile)
        .where(Profile.role == "student")
        .where(or_(
            Profile.full_name.ilike(pattern),
            Profile.email.ilike(pattern),
            Profile.student_id.ilike(pattern),
        ))
        .order_by(Profile.created_at.desc())
        .limit(50)
    )
    profiles = result.scalars().all()

    return [
        StudentListItem(
            id=str(p.id),
            full_name=p.full_name,
            email=p.email,
            student_id=p.student_id,
            role=p.role,
            created_at=p.created_at
        )
        for p in profiles
    ]

async def update_user_role(db: AsyncSession, profile_id: str, role: str) -> Optional[Dict[str, Any]]:
    """Promote/demote a user's role."""
    if role not in ("student", "teacher", "admin"):
        raise ValueError("Role must be 'student', 'teacher' or 'admin'")

    result = await db.execute(
        select(Profile).where(Profile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return None

    await db.execute(
        update(Profile).where(Profile.id == profile_id).values(role=role)
    )
    await db.commit()

    return {
        "id": str(profile.id),
        "full_name": profile.full_name,
        "email": profile.email,
        "student_id": profile.student_id,
        "role": role,
    }

async def admin_reset_password(email: str, new_password: str) -> bool:
    """
    Reset a user's password via the Supabase (GoTrue) admin API.
    Requires SUPABASE_SERVICE_ROLE_KEY to be configured.
    """
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        return False

    base = settings.SUPABASE_PROJECT_URL.rstrip("/")
    target_email = email.strip().lower()

    page = 1
    per_page = 50
    while True:
        url = f"{base}/auth/v1/admin/users?page={page}&per_page={per_page}"
        request = urllib.request.Request(url, headers={
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        })
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                users = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError:
            return False
        except urllib.error.URLError:
            return False

        if not users:
            return False

        for user in users:
            if (user.get("email") or "").lower() == target_email:
                update_url = f"{base}/auth/v1/admin/users/{user['id']}"
                update_request = urllib.request.Request(
                    update_url,
                    data=json.dumps({"password": new_password}).encode("utf-8"),
                    method="PUT",
                    headers={
                        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                        "Content-Type": "application/json",
                    },
                )
                try:
                    with urllib.request.urlopen(update_request, timeout=15) as response:
                        return response.status == 200
                except urllib.error.HTTPError:
                    return False
                except urllib.error.URLError:
                    return False

        page += 1
        if page > 20:
            return False
