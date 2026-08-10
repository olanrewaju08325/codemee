from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, ForeignKey, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String, primary_key=True)  # e.g., "wd101"
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="draft", nullable=False) # draft, under_review, approved, published, active, maintenance, archived
    is_active = Column(Boolean, default=False, nullable=False) # legacy compat
    whatsapp_group_cap = Column(Integer, default=40, nullable=False)
    platform_access_cap = Column(Integer, default=40, nullable=False)
    total_batches = Column(Integer, default=2, nullable=False)
    single_batch_only = Column(Boolean, default=False, nullable=False)
    price = Column(Numeric(12, 2), default=0, nullable=False)
    currency = Column(String, default="NGN", nullable=False)
    level = Column(String, default="Beginner", nullable=False)
    duration_weeks = Column(Integer, nullable=True)
    display_tag = Column(String, nullable=True)
    # Commercial delivery controls. These are deliberately independent from
    # legacy capacity fields so a course can be live, self-paced, or hybrid.
    delivery_mode = Column(String, default="hybrid", nullable=False)
    payment_required = Column(Boolean, default=True, nullable=False)
    installments_enabled = Column(Boolean, default=False, nullable=False)
    access_duration_days = Column(Integer, nullable=True)
    prerequisite_course_ids = Column(JSON, nullable=True, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Module(Base):
    __tablename__ = "modules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)
    project_scenario = Column(Text, nullable=True)
    project_instructions = Column(Text, nullable=True)
    project_solution = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    course = relationship("Course", backref="modules")

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    learning_objectives = Column(Text, nullable=True)
    estimated_duration = Column(Integer, default=30, nullable=False) # in minutes
    video_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    module = relationship("Module", backref="lessons")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    rubric_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    module = relationship("Module", backref="assignments")

class StudentProgress(Base):
    __tablename__ = "student_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Note: Composite unique constraint on (student_id, lesson_id) is enforced at database level

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    submission_text = Column(Text, nullable=False)
    submission_file = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    feedback = Column(Text, nullable=True)
    graded_by = Column(UUID(as_uuid=True), nullable=True)  # Foreign key to profiles.id
    graded_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_ai_flagged = Column(Boolean, default=False, nullable=False)

class CourseReview(Base):
    __tablename__ = "course_reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Note: UNIQUE(course_id, student_id) is enforced at the database level

class VideoQA(Base):
    __tablename__ = "video_qa"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(String, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to profiles.id
    timestamp_seconds = Column(Integer, nullable=False, default=0)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    answered_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    answered_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

class StudyGroup(Base):
    __tablename__ = "study_groups"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class StudyGroupMember(Base):
    __tablename__ = "study_group_members"
    
    group_id = Column(UUID(as_uuid=True), ForeignKey("study_groups.id", ondelete="CASCADE"), primary_key=True)
    student_id = Column(UUID(as_uuid=True), primary_key=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
