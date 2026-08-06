from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CertificateResponse(BaseModel):
    id: str
    student_id: str
    course_id: str
    certificate_code: str
    issued_at: datetime

    class Config:
        from_attributes = True

class CertificateCreate(BaseModel):
    course_id: str
    certificate_url: Optional[str] = None

class CertificateTemplateResponse(BaseModel):
    id: str
    course_id: str
    template_name: str
    primary_color: Optional[str]
    accent_color: Optional[str]
    logo_url: Optional[str]
    signatory_name: Optional[str]
    signatory_title: Optional[str]
    custom_css: Optional[str]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class CertificateTemplateUpsert(BaseModel):
    course_id: str
    template_name: str
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    logo_url: Optional[str] = None
    signatory_name: Optional[str] = None
    signatory_title: Optional[str] = None
    custom_css: Optional[str] = None
    is_active: Optional[bool] = True
