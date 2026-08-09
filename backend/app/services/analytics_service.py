"""Async, database-backed analytics for the three CodeMe panels."""
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def _scalar(db: AsyncSession, statement: str, params: dict | None = None):
    return (await db.execute(text(statement), params or {})).scalar() or 0


async def get_student_analytics(db: AsyncSession, user_id: str) -> dict:
    enrolled = await _scalar(db, "SELECT count(*) FROM student_enrollments WHERE student_id = :user_id AND status = 'enrolled'", {"user_id": user_id})
    completed = await _scalar(db, "SELECT count(*) FROM student_progress WHERE student_id = :user_id", {"user_id": user_id})
    attempts = await _scalar(db, "SELECT count(*) FROM quiz_attempts WHERE student_id = :user_id", {"user_id": user_id})
    average = await _scalar(db, "SELECT coalesce(round(avg(score), 2), 0) FROM quiz_attempts WHERE student_id = :user_id", {"user_id": user_id})
    passed = await _scalar(db, "SELECT count(*) FROM quiz_attempts WHERE student_id = :user_id AND passed = true", {"user_id": user_id})
    recent = (await db.execute(text("""SELECT score, created_at FROM quiz_attempts
        WHERE student_id = :user_id ORDER BY created_at DESC LIMIT 5"""), {"user_id": user_id})).mappings().all()
    return {
        "learning_progress": {"total_enrolled": enrolled, "completed_courses": 0, "completed_lessons": completed, "overall_completion": 0},
        "quiz_analytics": {"total_quizzes": attempts, "avg_score": float(average), "highest_score": 0, "pass_rate": round((passed / attempts * 100), 2) if attempts else 0, "recent_trend": [{"score": row["score"], "date": row["created_at"].isoformat()} for row in recent]},
        "learning_performance": {},
        "personal_productivity": {"ai_sessions": 0, "assignments_completed": 0, "active_days": 0, "hours_studied": 0},
        "recent_activity": [],
    }


async def get_teacher_analytics(db: AsyncSession, user_id: str) -> dict:
    courses = (await db.execute(text("""SELECT c.id, c.title FROM courses c
        JOIN course_teachers ct ON ct.course_id = c.id WHERE ct.teacher_id = :user_id ORDER BY c.title"""), {"user_id": user_id})).mappings().all()
    course_ids = [row["id"] for row in courses]
    students = await _scalar(db, "SELECT count(*) FROM student_enrollments WHERE course_id = ANY(:course_ids) AND status = 'enrolled'", {"course_ids": course_ids}) if course_ids else 0
    return {
        "overview": {"total_courses": len(courses), "total_students": students, "avg_quiz_score": 0, "total_submissions": 0},
        "student_activity": {},
        "course_performance": [{"name": row["title"], "students": 0} for row in courses],
        "quiz_averages": [],
    }


async def get_admin_analytics(db: AsyncSession) -> dict:
    students = await _scalar(db, "SELECT count(*) FROM profiles WHERE role = 'student'")
    teachers = await _scalar(db, "SELECT count(*) FROM profiles WHERE role = 'teacher'")
    courses = await _scalar(db, "SELECT count(*) FROM courses")
    enrollments = await _scalar(db, "SELECT count(*) FROM student_enrollments WHERE status = 'enrolled'")
    revenue = await _scalar(db, "SELECT coalesce(sum(amount_due), 0) FROM invoices WHERE status = 'paid'")
    pending = await _scalar(db, "SELECT count(*) FROM payment_submissions WHERE status = 'submitted'")
    return {
        "platform_overview": {"total_students": students, "total_teachers": teachers, "total_courses": courses, "active_enrollments": enrollments},
        "financial_dashboard": {"total_revenue": float(revenue), "pending_payments": pending, "approved_transactions": 0},
        "enrollment_analytics": {"new_this_month": 0},
        "learning_analytics": {},
        "operational_analytics": {},
        "ai_analytics": {"total_chat_requests": 0, "total_review_requests": 0},
    }
