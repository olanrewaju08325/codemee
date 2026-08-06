from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    course_id = Column(String, nullable=False)  # Foreign key to courses.id
    certificate_code = Column(String, nullable=False, unique=True)
    issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class CertificateTemplate(Base):
    __tablename__ = "certificate_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(String, nullable=False, unique=True)  # Foreign key to courses.id
    template_name = Column(String, nullable=False)
    primary_color = Column(String, default="#0C4A8C", nullable=True)
    accent_color = Column(String, default="#8B2FA6", nullable=True)
    logo_url = Column(String, nullable=True)
    signatory_name = Column(String, default="Olamide A.O", nullable=True)
    signatory_title = Column(String, default="Director, CodeMe Academy", nullable=True)
    custom_css = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
