from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class InvoiceCreate(BaseModel):
    student_id: UUID
    course_id: str
    batch_id: Optional[UUID] = None
    amount_due: Decimal = Field(ge=0)
    due_at: Optional[datetime] = None


class PaymentSubmissionCreate(BaseModel):
    payment_method_id: UUID
    payer_name: str = Field(min_length=2, max_length=255)
    amount_claimed: Decimal = Field(ge=0)
    transfer_reference: str = Field(min_length=3, max_length=128)
    receipt_storage_path: str = Field(min_length=5, max_length=1024)


class PaymentDecision(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=2000)


class InvoiceResponse(BaseModel):
    id: UUID
    reference: str
    student_id: UUID
    course_id: str
    batch_id: Optional[UUID]
    amount_due: Decimal
    currency: str
    status: str
    due_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentSubmissionResponse(BaseModel):
    id: UUID
    invoice_id: UUID
    payment_method_id: UUID
    payer_name: str
    amount_claimed: Decimal
    transfer_reference: str
    receipt_storage_path: str
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True
