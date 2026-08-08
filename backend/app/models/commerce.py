"""Canonical ledger models for course-fee payments.

The existing ExamPaymentVerification table is retained for quiz retakes. These
models are used exclusively for invoices that activate academy enrolment.
"""
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    provider = Column(String(100), nullable=True)
    instructions = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(64), unique=True, nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False, index=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("batches.id"), nullable=True)
    amount_due = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="NGN", nullable=False)
    status = Column(String(32), default="issued", nullable=False, index=True)
    due_at = Column(DateTime(timezone=True), nullable=True)
    issued_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class PaymentSubmission(Base):
    __tablename__ = "payment_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    payment_method_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id"), nullable=False)
    payer_name = Column(String(255), nullable=False)
    amount_claimed = Column(Numeric(12, 2), nullable=False)
    transfer_reference = Column(String(128), nullable=False, index=True)
    receipt_storage_path = Column(Text, nullable=False)
    status = Column(String(32), default="submitted", nullable=False, index=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("invoice_id", "transfer_reference", name="uq_payment_submission_invoice_reference"),
    )


class PaymentVerification(Base):
    __tablename__ = "payment_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("payment_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    verifier_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    decision = Column(String(16), nullable=False)
    reason = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
