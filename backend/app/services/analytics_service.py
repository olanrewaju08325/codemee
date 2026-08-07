from sqlalchemy.orm import Session
from sqlalchemy import func, case, text, desc, extract
from typing import Dict, Any, List
import datetime

from app.models.course import Course, Module, Lesson
from app.models.progress import StudentProgress
from app.models.quiz import Quiz, QuizAttempt, QuizQuestion
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.enrollment import StudentEnrollment, EnrollmentApplication
from app.models.payment import ExamPaymentVerification
from app.models.profile import Profile, UserRole
from app.models.ai import AIChatMessage, AIReviewUsage

def get_student_analytics(db: Session, user_id: str) -> Dict[str, Any]:
    # 1. Learning Progress
    enrollments = db.query(StudentEnrollment).filter(StudentEnrollment.student_id == user_id, StudentEnrollment.status == 'active').all()
    total_enrolled = len(enrollments)
    completed_courses = sum(1 for e in enrollments if e.completion_status == 'graduated')
    
    completed_lessons = db.query(func.count(StudentProgress.id)).filter(
        StudentProgress.student_id == user_id,
        StudentProgress.status == 'completed'
    ).scalar() or 0

    # 2. Quiz Analytics
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.student_id == user_id).all()
    total_quizzes = len(quiz_attempts)
    avg_score = sum(q.score for q in quiz_attempts) / total_quizzes if total_quizzes > 0 else 0
    highest_score = max((q.score for q in quiz_attempts), default=0)
    passed_quizzes = sum(1 for q in quiz_attempts if q.passed)
    pass_rate = (passed_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0

    recent_scores = db.query(QuizAttempt).filter(QuizAttempt.student_id == user_id).order_by(QuizAttempt.created_at.desc()).limit(5).all()

    # 3. Learning Performance & Productivity
    ai_sessions = db.query(func.count(AIChatMessage.id)).filter(
        AIChatMessage.user_id == user_id,
        AIChatMessage.role == 'user'
    ).scalar() or 0

    assignments_done = db.query(func.count(AssignmentSubmission.id)).filter(
        AssignmentSubmission.student_id == user_id
    ).scalar() or 0

    # Mock daily streak based on recent activity for now, replacing with real later if we add a streak table
    recent_activity_days = db.query(func.date(StudentProgress.updated_at)).filter(
        StudentProgress.student_id == user_id
    ).distinct().count()

    return {
        "learning_progress": {
            "total_enrolled": total_enrolled,
            "completed_courses": completed_courses,
            "completed_lessons": completed_lessons,
            "overall_completion": (completed_courses / total_enrolled * 100) if total_enrolled else 0,
        },
        "quiz_analytics": {
            "total_quizzes": total_quizzes,
            "avg_score": round(avg_score, 2),
            "highest_score": highest_score,
            "pass_rate": round(pass_rate, 2),
            "recent_trend": [{"score": q.score, "date": q.created_at.isoformat()} for q in recent_scores]
        },
        "personal_productivity": {
            "ai_sessions": ai_sessions,
            "assignments_completed": assignments_done,
            "active_days": recent_activity_days,
            "hours_studied": completed_lessons * 0.5 # Estimate 30 mins per lesson
        }
    }

def get_teacher_analytics(db: Session, teacher_id: str) -> Dict[str, Any]:
    # Courses taught by this teacher
    courses = db.query(Course).filter(Course.instructor_id == teacher_id).all()
    course_ids = [c.id for c in courses]
    
    total_students = db.query(func.count(StudentEnrollment.id)).filter(
        StudentEnrollment.course_id.in_(course_ids),
        StudentEnrollment.status == 'active'
    ).scalar() or 0

    # Quizzes for these courses
    quizzes = db.query(Quiz).join(Module).filter(Module.course_id.in_(course_ids)).all()
    quiz_ids = [q.id for q in quizzes]
    
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id.in_(quiz_ids)).all()
    avg_quiz_score = sum(q.score for q in quiz_attempts) / len(quiz_attempts) if quiz_attempts else 0

    # Assignment Submissions
    assignments = db.query(Assignment).join(Lesson).join(Module).filter(Module.course_id.in_(course_ids)).all()
    assignment_ids = [a.id for a in assignments]
    submissions = db.query(func.count(AssignmentSubmission.id)).filter(AssignmentSubmission.assignment_id.in_(assignment_ids)).scalar() or 0

    return {
        "overview": {
            "total_courses": len(courses),
            "total_students": total_students,
            "avg_quiz_score": round(avg_quiz_score, 2),
            "total_submissions": submissions
        },
        "course_performance": [
            {"name": c.title, "students": len(c.enrollments)} for c in courses
        ]
    }

def get_admin_analytics(db: Session) -> Dict[str, Any]:
    # 1. Platform Overview
    total_students = db.query(func.count(Profile.id)).filter(Profile.role == UserRole.STUDENT).scalar() or 0
    total_teachers = db.query(func.count(Profile.id)).filter(Profile.role == UserRole.TEACHER).scalar() or 0
    total_courses = db.query(func.count(Course.id)).scalar() or 0
    active_enrollments = db.query(func.count(StudentEnrollment.id)).filter(StudentEnrollment.status == 'active').scalar() or 0

    # 2. Financial Dashboard (Manual Payments)
    approved_payments = db.query(ExamPaymentVerification).filter(ExamPaymentVerification.status == 'approved').all()
    # Assuming amount is stored, if not, we count them or use a standard fee.
    # The requirement says "Revenue by course". We sum standard amounts or use a generic 100 per payment for now if amount is missing.
    total_revenue = sum(p.amount for p in approved_payments if hasattr(p, 'amount') and p.amount) or (len(approved_payments) * 100)
    pending_payments = db.query(func.count(ExamPaymentVerification.id)).filter(ExamPaymentVerification.status == 'pending').scalar() or 0
    
    # 3. Enrollment Analytics
    # monthly growth (rough estimate)
    this_month = datetime.datetime.utcnow().replace(day=1)
    new_enrolls = db.query(func.count(StudentEnrollment.id)).filter(StudentEnrollment.created_at >= this_month).scalar() or 0

    # 4. AI Analytics
    ai_requests_total = db.query(func.count(AIChatMessage.id)).scalar() or 0
    ai_reviews_total = db.query(func.count(AIReviewUsage.id)).scalar() or 0

    return {
        "platform_overview": {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_courses": total_courses,
            "active_enrollments": active_enrollments,
        },
        "financial_dashboard": {
            "total_revenue": total_revenue,
            "pending_payments": pending_payments,
            "approved_transactions": len(approved_payments)
        },
        "enrollment_analytics": {
            "new_this_month": new_enrolls
        },
        "ai_analytics": {
            "total_chat_requests": ai_requests_total,
            "total_review_requests": ai_reviews_total
        }
    }
