from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class AdminSettingBase(BaseModel):
    setting_key: str
    setting_value: Optional[str] = None
    description: Optional[str] = None

class AdminSettingCreate(AdminSettingBase):
    pass

class AdminSettingUpdate(BaseModel):
    setting_value: Optional[str] = None
    description: Optional[str] = None

class AdminSettingResponse(AdminSettingBase):
    id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True
