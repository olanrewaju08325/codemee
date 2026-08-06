from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(String, nullable=True)  # Foreign key to courses.id
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    content = Column(Text, nullable=False)
    status = Column(String, default="approved", nullable=False)  # approved, held
    is_pinned = Column(Boolean, default=False, nullable=False)
    deleted_by = Column(UUID(as_uuid=True), nullable=True)  # Foreign key to auth.users.id
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    replies = relationship("ForumReply", backref="post", order_by="ForumReply.created_at", cascade="all, delete-orphan")

class ForumReply(Base):
    __tablename__ = "forum_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
