from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ForumReplyResponse(BaseModel):
    id: str
    post_id: str
    user_id: str
    content: str
    created_at: datetime
    author: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ForumPostResponse(BaseModel):
    id: str
    course_id: Optional[str]
    student_id: str
    content: str
    status: str
    is_pinned: bool
    is_deleted: bool
    created_at: datetime
    author: Optional[Dict[str, Any]] = None
    replies: Optional[List[ForumReplyResponse]] = None

    class Config:
        from_attributes = True

class ForumPostCreate(BaseModel):
    course_id: str
    content: str

class ForumPostUpdate(BaseModel):
    content: Optional[str] = None
    is_pinned: Optional[bool] = None

class ForumModerationUpdate(BaseModel):
    status: str  # approved or held

class ForumReplyCreate(BaseModel):
    content: str

class ForumReplyUpdate(BaseModel):
    content: str
