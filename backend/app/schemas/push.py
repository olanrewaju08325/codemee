from pydantic import BaseModel
from typing import Optional

class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: PushSubscriptionKeys

class PushPreferencesResponse(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    mute_assignments: bool = False
    mute_grades: bool = False
    mute_live: bool = False
    mute_announcements: bool = False
    mute_certificates: bool = False

class PushPreferencesUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    mute_assignments: Optional[bool] = None
    mute_grades: Optional[bool] = None
    mute_live: Optional[bool] = None
    mute_announcements: Optional[bool] = None
    mute_certificates: Optional[bool] = None
