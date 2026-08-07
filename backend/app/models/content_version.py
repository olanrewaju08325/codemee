from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class ContentVersionHistory(Base):
    __tablename__ = "content_version_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    entity_id = Column(String, nullable=False, index=True) # e.g. Course ID or Lesson UUID (stored as string for flexibility)
    entity_type = Column(String, nullable=False) # 'course', 'module', 'lesson', 'quiz'
    version_number = Column(Integer, nullable=False, default=1)
    author_id = Column(UUID(as_uuid=True), nullable=False) # The admin/teacher who made the change
    change_summary = Column(Text, nullable=False)
    snapshot = Column(Text, nullable=False) # JSON string representation of the object state
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

