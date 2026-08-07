from sqlalchemy import Column, String, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    admin_id = Column(UUID(as_uuid=True), nullable=False)
    admin_name = Column(String, nullable=True)
    action = Column(String, nullable=False)
    target_object = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    details = Column(Text, nullable=True) # E.g., Previous value / New value
    created_at = Column(DateTime(timezone=True), server_default=func.now())

