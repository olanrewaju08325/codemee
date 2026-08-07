from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AIChatRequest(BaseModel):
    message: str
    context_code: Optional[str] = None


class AIChatResponse(BaseModel):
    reply: str
    remaining: int
    daily_limit: int
    provider: str


class AIChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class AIReviewResponse(BaseModel):
    id: str
    submission_id: str
    feedback: Optional[str] = None
    score: Optional[int] = None
    is_ai_flagged: bool
    status: str
    created_at: datetime
    assignment_title: Optional[str] = None
    student_name: Optional[str] = None

    class Config:
        from_attributes = True


class AIConfirmReviewRequest(BaseModel):
    review_id: str
    feedback: str
    status: str  # approved | rejected
    is_ai_flagged: bool = False


class AISettingsResponse(BaseModel):
    daily_limit: int
    review_daily_limit: int
    provider: str


class AISettingsUpdate(BaseModel):
    daily_limit: int
    review_daily_limit: int

class AIGenerateRequest(BaseModel):
    prompt: str
    context_type: str  # e.g., 'quiz', 'announcement', 'lesson_outline'
    context_data: Optional[str] = None

class AIGenerateResponse(BaseModel):
    result: str
