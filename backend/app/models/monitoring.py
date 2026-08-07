from sqlalchemy import Column, String, DateTime, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class SystemEventLog(Base):
    __tablename__ = "system_event_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    event_type = Column(String, index=True) # auth, registration, payment, etc.
    severity = Column(String, default="info") # info, warning, critical
    user_id = Column(UUID(as_uuid=True), nullable=True)
    role = Column(String, nullable=True)
    request_id = Column(String, index=True)
    resource_affected = Column(String, nullable=True)
    outcome = Column(String, nullable=True) # success, failure

class ErrorLog(Base):
    __tablename__ = "error_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    error_type = Column(String)
    message = Column(Text)
    stack_trace = Column(Text, nullable=True)
    request_id = Column(String, nullable=True)
    severity = Column(String, default="error")

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    severity = Column(String, default="warning")
    status = Column(String, default="open") # open, investigating, resolved
    detection_time = Column(DateTime(timezone=True), server_default=func.now())
    resolution_time = Column(DateTime(timezone=True), nullable=True)
    root_cause = Column(Text, nullable=True)

