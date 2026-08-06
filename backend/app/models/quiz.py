from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to modules.id
    title = Column(String, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)  # optional exam date/time
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    questions = relationship(
        "QuizQuestion",
        backref="quiz",
        order_by="QuizQuestion.order_index",
        cascade="all, delete-orphan"
    )

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # multiple_choice, true_false, short_answer, fill_blank
    options = Column(JSONB, nullable=True)  # JSON array of options for multiple choice / true_false
    correct_answer = Column(Text, nullable=False)
    blank_answer = Column(Text, nullable=True)  # expected fill-in-the-blank answer
    order_index = Column(Integer, default=0, nullable=False)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to quizzes.id
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    score = Column(Integer, nullable=False)
    passed = Column(Boolean, nullable=False)
    attempt_number = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
