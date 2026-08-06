"""Scheduled reminder fan-out for Web Push / in-app notifications.

Invoked by an external cron (or Supabase pg_cron) that POSTs to the
/api/cron/live-class-reminders endpoint. Kept dependency-free on any queue so it
works from a plain `curl` cron job.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from app.models.live_class import LiveClassSchedule
from app.models.course import Module
from app.models.enrollment import StudentEnrollment
from app.models.quiz import Quiz
from app.models.notification import Notification
from app.services.notification_service import trigger_live_class_soon, trigger_exam_soon

LIVE_CLASS_REMINDER_MINUTES = 15
EXAM_REMINDER_HOURS = 24


async def send_live_class_reminders(
    db: AsyncSession, minutes_ahead: int = LIVE_CLASS_REMINDER_MINUTES
) -> int:
    """Remind enrolled students about live classes starting within the window.

    Dedupes by checking for an existing 'live_class_soon' notification for the
    same class + user, so repeated cron runs don't spam.
    """
    now = datetime.now()
    window_end = now + timedelta(minutes=minutes_ahead)

    result = await db.execute(
        select(LiveClassSchedule).where(
            LiveClassSchedule.is_active == True,
            LiveClassSchedule.scheduled_at > now,
            LiveClassSchedule.scheduled_at <= window_end,
            LiveClassSchedule.module_id.isnot(None),
        )
    )
    classes = result.scalars().all()
    if not classes:
        return 0

    reminded = 0
    for live_class in classes:
        module = (
            await db.execute(
                select(Module).where(Module.id == live_class.module_id)
            )
        ).scalar_one_or_none()
        if not module:
            continue

        students_result = await db.execute(
            select(StudentEnrollment.student_id).where(
                StudentEnrollment.course_id == module.course_id,
                StudentEnrollment.status == "enrolled",
                StudentEnrollment.has_platform_access == True,
            )
        )
        student_ids = list(students_result.scalars().all())
        if not student_ids:
            continue

        sent_result = await db.execute(
            select(Notification.user_id).where(
                Notification.event_type == "live_class_soon",
                Notification.related_entity_id == live_class.id,
                Notification.user_id.in_(student_ids),
            )
        )
        already_notified = set(sent_result.scalars().all())

        for student_id in student_ids:
            if student_id in already_notified:
                continue
            await trigger_live_class_soon(
                db, str(student_id), str(live_class.id), live_class.title
            )
            reminded += 1

    return reminded


async def send_exam_reminders(
    db: AsyncSession, hours_ahead: int = EXAM_REMINDER_HOURS
) -> int:
    """Remind enrolled students about scheduled exams starting within the window.

    Only quizzes with a `scheduled_at` set are treated as exams. Dedupes by
    checking for an existing 'exam_reminder' notification for the same quiz +
    user, so repeated cron runs don't spam.
    """
    now = datetime.now()
    window_end = now + timedelta(hours=hours_ahead)

    result = await db.execute(
        select(Quiz).where(
            Quiz.scheduled_at.isnot(None),
            Quiz.scheduled_at > now,
            Quiz.scheduled_at <= window_end,
        )
    )
    quizzes = result.scalars().all()
    if not quizzes:
        return 0

    reminded = 0
    for quiz in quizzes:
        module = (
            await db.execute(
                select(Module).where(Module.id == quiz.module_id)
            )
        ).scalar_one_or_none()
        if not module:
            continue

        students_result = await db.execute(
            select(StudentEnrollment.student_id).where(
                StudentEnrollment.course_id == module.course_id,
                StudentEnrollment.status == "enrolled",
                StudentEnrollment.has_platform_access == True,
            )
        )
        student_ids = list(students_result.scalars().all())
        if not student_ids:
            continue

        sent_result = await db.execute(
            select(Notification.user_id).where(
                Notification.event_type == "exam_reminder",
                Notification.related_entity_id == quiz.id,
                Notification.user_id.in_(student_ids),
            )
        )
        already_notified = set(sent_result.scalars().all())

        for student_id in student_ids:
            if student_id in already_notified:
                continue
            await trigger_exam_soon(
                db, str(student_id), str(quiz.id), quiz.title
            )
            reminded += 1

    return reminded
