from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

class TicketCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    category: str
    description: str = Field(min_length=5, max_length=5000)
    priority: str = "medium"
    course_id: Optional[str] = None

class TicketReply(BaseModel):
    body: str = Field(min_length=1, max_length=5000)

class TicketResponse(BaseModel):
    id: UUID
    student_id: UUID
    owner_id: Optional[UUID]
    course_id: Optional[str]
    title: str
    category: str
    priority: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
