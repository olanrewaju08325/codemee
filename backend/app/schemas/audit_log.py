from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class AuditLogResponse(BaseModel):
    id: UUID
    admin_id: UUID
    admin_name: Optional[str] = None
    action: str
    target_object: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

