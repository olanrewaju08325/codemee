from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class AnalyticsResponse(BaseModel):
    total_students: int
    active_enrollments: int
    pending_payments: int
    pending_grading: int

class GradeSubmissionRequest(BaseModel):
    status: str  # approved or rejected
    feedback: Optional[str] = None

class FlagSubmissionRequest(BaseModel):
    is_ai_flagged: bool

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

class UpdateUserRoleRequest(BaseModel):
    role: str  # student, teacher or admin

class StudentListItem(BaseModel):
    id: str
    full_name: Optional[str]
    email: Optional[str]
    student_id: Optional[str]
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class GradingQueueItem(BaseModel):
    id: str
    assignment_id: str
    student_id: str
    submission_text: Optional[str]
    submission_file: Optional[str]
    status: str
    feedback: Optional[str]
    graded_by: Optional[str]
    graded_at: Optional[datetime]
    created_at: datetime
    is_ai_flagged: bool
    profiles: Optional[Dict[str, Any]] = None
    assignments: Optional[Dict[str, Any]] = None
