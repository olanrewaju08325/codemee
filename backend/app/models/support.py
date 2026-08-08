import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True, index=True)
    course_id = Column(String, ForeignKey("courses.id"), nullable=True)
    title = Column(String(200), nullable=False)
    category = Column(String(32), nullable=False)
    priority = Column(String(16), default="medium", nullable=False)
    status = Column(String(32), default="open", nullable=False, index=True)
    first_response_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    body = Column(Text, nullable=False)
    visibility = Column(String(16), default="student", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
