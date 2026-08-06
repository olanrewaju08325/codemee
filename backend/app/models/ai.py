from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class AIChatMessage(Base):
    __tablename__ = "ai_chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    role = Column(String, nullable=False)  # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    context_code = Column(Text, nullable=True)  # snapshot of the editor code at ask time
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AIReview(Base):
    __tablename__ = "ai_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), nullable=False, unique=True)  # assignment_submissions.id
    feedback = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    is_ai_flagged = Column(Boolean, default=False, nullable=False)
    status = Column(String, default="draft", nullable=False)  # draft | confirmed | discarded
    created_by = Column(UUID(as_uuid=True), nullable=False)  # teacher/admin id
    confirmed_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)


class AIReviewUsage(Base):
    __tablename__ = "ai_review_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # teacher/admin id who generated the draft
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AISetting(Base):
    __tablename__ = "ai_settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
