"""Course-assignment authorization for teacher-managed academic content."""
from typing import Any, Dict
from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def require_module_teacher(db: AsyncSession, module_id: str, user: Dict[str, Any]) -> None:
    if user.get("role") == "admin":
        return
    result = await db.execute(text("""
        SELECT 1 FROM modules m
        JOIN course_teachers ct ON ct.course_id = m.course_id
        WHERE m.id = :module_id AND ct.teacher_id = :teacher_id
    """), {"module_id": module_id, "teacher_id": user["user_id"]})
    if not result.first():
        raise HTTPException(status_code=403, detail="You are not assigned to this course")

async def require_course_teacher(db: AsyncSession, course_id: str, user: Dict[str, Any]) -> None:
    if user.get("role") == "admin": return
    result = await db.execute(text("SELECT 1 FROM course_teachers WHERE course_id = :course_id AND teacher_id = :teacher_id"), {"course_id": course_id, "teacher_id": user["user_id"]})
    if not result.first(): raise HTTPException(status_code=403, detail="You are not assigned to this course")

async def require_lesson_teacher(db: AsyncSession, lesson_id: str, user: Dict[str, Any]) -> None:
    if user.get("role") == "admin": return
    result = await db.execute(text("SELECT 1 FROM lessons l JOIN modules m ON m.id=l.module_id JOIN course_teachers ct ON ct.course_id=m.course_id WHERE l.id=:id AND ct.teacher_id=:teacher_id"), {"id": lesson_id, "teacher_id": user["user_id"]})
    if not result.first(): raise HTTPException(status_code=403, detail="You are not assigned to this course")

async def require_assignment_teacher(db: AsyncSession, assignment_id: str, user: Dict[str, Any]) -> None:
    if user.get("role") == "admin": return
    result = await db.execute(text("SELECT 1 FROM assignments a JOIN modules m ON m.id=a.module_id JOIN course_teachers ct ON ct.course_id=m.course_id WHERE a.id=:id AND ct.teacher_id=:teacher_id"), {"id": assignment_id, "teacher_id": user["user_id"]})
    if not result.first(): raise HTTPException(status_code=403, detail="You are not assigned to this course")

async def require_live_class_teacher(db: AsyncSession, live_class_id: str, user: Dict[str, Any]) -> None:
    if user.get("role") == "admin": return
    result = await db.execute(text("SELECT 1 FROM live_class_schedules lc JOIN modules m ON m.id=lc.module_id JOIN course_teachers ct ON ct.course_id=m.course_id WHERE lc.id=:id AND ct.teacher_id=:teacher_id"), {"id": live_class_id, "teacher_id": user["user_id"]})
    if not result.first(): raise HTTPException(status_code=403, detail="You are not assigned to this course")


async def require_quiz_teacher(db: AsyncSession, quiz_id: str, user: Dict[str, Any]) -> None:
    if user.get("role") == "admin":
        return
    result = await db.execute(text("""
        SELECT 1 FROM quizzes q
        JOIN modules m ON m.id = q.module_id
        JOIN course_teachers ct ON ct.course_id = m.course_id
        WHERE q.id = :quiz_id AND ct.teacher_id = :teacher_id
    """), {"quiz_id": quiz_id, "teacher_id": user["user_id"]})
    if not result.first():
        raise HTTPException(status_code=403, detail="You are not assigned to this course")


async def require_question_teacher(db: AsyncSession, question_id: str, user: Dict[str, Any]) -> None:
    if user.get("role") == "admin":
        return
    result = await db.execute(text("""
        SELECT 1 FROM quiz_questions qq
        JOIN quizzes q ON q.id = qq.quiz_id
        JOIN modules m ON m.id = q.module_id
        JOIN course_teachers ct ON ct.course_id = m.course_id
        WHERE qq.id = :question_id AND ct.teacher_id = :teacher_id
    """), {"question_id": question_id, "teacher_id": user["user_id"]})
    if not result.first():
        raise HTTPException(status_code=403, detail="You are not assigned to this course")
