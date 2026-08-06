from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import selectinload
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt
from app.schemas.quiz import (
    QuizResponse,
    QuizAttemptResponse,
    QuizQuestionResponse,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
    QuizCreate,
    QuizUpdate,
    QuizQuestionCreate,
    QuizQuestionUpdate
)

PASSING_PERCENT = 66

def _serialize_options(options: Any) -> Any:
    """Normalise options to JSON (list preferred)."""
    if options is None:
        return None
    if isinstance(options, str):
        try:
            return json.loads(options)
        except (ValueError, TypeError):
            return None
    return options

def _serialize_question(q: QuizQuestion, include_answer: bool = False) -> QuizQuestionResponse:
    return QuizQuestionResponse(
        id=str(q.id),
        quiz_id=str(q.quiz_id),
        question_text=q.question_text,
        question_type=q.question_type,
        options=_serialize_options(q.options),
        correct_answer=q.correct_answer if include_answer else None,
        blank_answer=q.blank_answer if include_answer else None,
        order_index=q.order_index
    )

def _serialize_quiz(q: Quiz, include_answer: bool = False) -> QuizResponse:
    questions = [
        _serialize_question(question, include_answer)
        for question in sorted(q.questions, key=lambda x: x.order_index or 0)
    ] if q.questions else None
    return QuizResponse(
        id=str(q.id),
        module_id=str(q.module_id),
        title=q.title,
        scheduled_at=q.scheduled_at,
        created_at=q.created_at,
        questions=questions
    )

def _serialize_attempt(a: QuizAttempt, quiz_title: Optional[str] = None) -> QuizAttemptResponse:
    quizzes = {"title": quiz_title} if quiz_title else None
    return QuizAttemptResponse(
        id=str(a.id),
        quiz_id=str(a.quiz_id),
        student_id=str(a.student_id),
        score=a.score,
        passed=a.passed,
        attempt_number=a.attempt_number,
        created_at=a.created_at,
        quizzes=quizzes
    )

async def get_quizzes_by_module(db: AsyncSession, module_id: str) -> List[QuizResponse]:
    """Get all quizzes for a module."""
    result = await db.execute(
        select(Quiz)
        .where(Quiz.module_id == module_id)
        .order_by(Quiz.created_at)
    )
    quizzes = result.scalars().all()

    return [
        QuizResponse(
            id=str(q.id),
            module_id=str(q.module_id),
            title=q.title,
            scheduled_at=q.scheduled_at,
            created_at=q.created_at
        )
        for q in quizzes
    ]

async def get_quiz_by_id(db: AsyncSession, quiz_id: str, include_answers: bool = False) -> Optional[QuizResponse]:
    """Get a specific quiz with its questions."""
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one_or_none()

    if not quiz:
        return None

    return _serialize_quiz(quiz, include_answer=include_answers)

async def get_quiz_with_answers(db: AsyncSession, quiz_id: str) -> Optional[QuizResponse]:
    """Get a quiz with correct answers (for teachers/admins)."""
    return await get_quiz_by_id(db, quiz_id, include_answers=True)

async def get_user_quiz_attempts(db: AsyncSession, user_id: str, quiz_id: str) -> List[QuizAttemptResponse]:
    """Get all quiz attempts for a user for a specific quiz."""
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.student_id == user_id)
        .where(QuizAttempt.quiz_id == quiz_id)
        .order_by(QuizAttempt.created_at.desc())
    )
    attempts = result.scalars().all()

    return [_serialize_attempt(a) for a in attempts]

async def get_all_quiz_attempts(db: AsyncSession, quiz_id: str) -> List[QuizAttemptResponse]:
    """Get all quiz attempts (for teachers)."""
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.quiz_id == quiz_id)
        .order_by(QuizAttempt.created_at.desc())
    )
    attempts = result.scalars().all()

    return [_serialize_attempt(a) for a in attempts]

async def get_all_user_quiz_attempts(db: AsyncSession, user_id: str) -> List[QuizAttemptResponse]:
    """Get all quiz attempts for a user across every quiz."""
    result = await db.execute(
        select(QuizAttempt, Quiz.title)
        .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
        .where(QuizAttempt.student_id == user_id)
        .order_by(QuizAttempt.created_at.desc())
    )
    rows = result.all()

    return [_serialize_attempt(a, quiz_title) for a, quiz_title in rows]

async def submit_quiz(
    db: AsyncSession,
    quiz_id: str,
    user_id: str,
    submission: QuizSubmissionRequest
) -> QuizSubmissionResponse:
    """
    Submit a quiz attempt and calculate score.
    Replaces: QuizView.tsx lines 128-228
    """
    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id)
    )
    questions = result.scalars().all()

    answers = submission.answers or {}
    answers_correct = 0
    for q in questions:
        user_answer = (answers.get(str(q.id)) or "").strip()
        if not user_answer:
            continue
        if q.question_type == "fill_blank":
            expected = (q.blank_answer or q.correct_answer or "").strip().lower()
            if user_answer.lower() == expected:
                answers_correct += 1
        else:
            if user_answer == (q.correct_answer or ""):
                answers_correct += 1

    total_questions = len(questions)
    score = round((answers_correct / total_questions) * 100) if total_questions else 0
    passed = score >= PASSING_PERCENT

    result = await db.execute(
        select(func.count(QuizAttempt.id))
        .where(QuizAttempt.quiz_id == quiz_id)
        .where(QuizAttempt.student_id == user_id)
    )
    attempt_count = result.scalar() or 0

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        student_id=user_id,
        score=score,
        passed=passed,
        attempt_number=attempt_count + 1
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)

    return QuizSubmissionResponse(
        attempt_id=str(attempt.id),
        score=score,
        passed=passed,
        answers_correct=answers_correct,
        total_questions=total_questions
    )

# Admin/Teacher quiz management functions

async def create_quiz(
    db: AsyncSession,
    module_id: str,
    title: str,
    scheduled_at: Optional[datetime] = None,
) -> QuizResponse:
    """Create a new quiz."""
    quiz = Quiz(
        module_id=module_id,
        title=title,
        scheduled_at=scheduled_at,
    )
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)

    return QuizResponse(
        id=str(quiz.id),
        module_id=str(quiz.module_id),
        title=quiz.title,
        scheduled_at=quiz.scheduled_at,
        created_at=quiz.created_at
    )

async def update_quiz(
    db: AsyncSession, quiz_id: str, quiz_data: QuizUpdate
) -> Optional[QuizResponse]:
    """Update an existing quiz (title and/or scheduled_at)."""
    update_data = quiz_data.model_dump(exclude_unset=True)
    if update_data:
        await db.execute(
            update(Quiz).where(Quiz.id == quiz_id).values(**update_data)
        )
        await db.commit()

    return await get_quiz_by_id(db, quiz_id, include_answers=True)

async def delete_quiz(db: AsyncSession, quiz_id: str) -> bool:
    """Delete a quiz."""
    await db.execute(
        delete(Quiz).where(Quiz.id == quiz_id)
    )
    await db.commit()
    return True

async def create_quiz_question(
    db: AsyncSession,
    quiz_id: str,
    question_data: QuizQuestionCreate
) -> QuizQuestionResponse:
    """Create a new quiz question."""
    question = QuizQuestion(
        quiz_id=quiz_id,
        question_text=question_data.question_text,
        question_type=question_data.question_type,
        options=_serialize_options(question_data.options),
        correct_answer=question_data.correct_answer,
        blank_answer=question_data.blank_answer,
        order_index=question_data.order_index
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)

    return _serialize_question(question, include_answer=True)

async def update_quiz_question(
    db: AsyncSession,
    question_id: str,
    question_data: QuizQuestionUpdate
) -> Optional[QuizQuestionResponse]:
    """Update an existing quiz question."""
    update_data = question_data.model_dump(exclude_unset=True)
    if "options" in update_data:
        update_data["options"] = _serialize_options(update_data["options"])
    if update_data:
        await db.execute(
            update(QuizQuestion).where(QuizQuestion.id == question_id).values(**update_data)
        )
        await db.commit()

    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.id == question_id)
    )
    question = result.scalar_one_or_none()

    if not question:
        return None

    return _serialize_question(question, include_answer=True)

async def delete_quiz_question(db: AsyncSession, question_id: str) -> bool:
    """Delete a quiz question."""
    await db.execute(
        delete(QuizQuestion).where(QuizQuestion.id == question_id)
    )
    await db.commit()
    return True
