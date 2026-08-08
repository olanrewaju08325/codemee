"""Transactional course-fee workflow used by the new commerce routes."""
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.commerce import Invoice, PaymentMethod, PaymentSubmission, PaymentVerification
from app.models.course import Course
from app.models.enrollment import StudentEnrollment
from app.schemas.commerce import InvoiceCreate, PaymentSubmissionCreate


def _reference() -> str:
    return f"CMA-{datetime.now(timezone.utc):%Y%m%d}-{uuid.uuid4().hex[:8].upper()}"


async def create_invoice(db: AsyncSession, data: InvoiceCreate, issuer_id: str) -> Invoice:
    course = (await db.execute(select(Course).where(Course.id == data.course_id))).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if not course.payment_required:
        raise HTTPException(status_code=400, detail="This course does not require an invoice")
    invoice = Invoice(
        reference=_reference(), student_id=data.student_id, course_id=data.course_id,
        batch_id=data.batch_id, amount_due=data.amount_due, due_at=data.due_at,
        issued_by=uuid.UUID(issuer_id), status="awaiting_payment",
    )
    db.add(invoice)
    await db.flush()
    return invoice


async def submit_payment(db: AsyncSession, invoice_id: uuid.UUID, student_id: str, data: PaymentSubmissionCreate) -> PaymentSubmission:
    invoice = (await db.execute(select(Invoice).where(Invoice.id == invoice_id).with_for_update())).scalar_one_or_none()
    if not invoice or str(invoice.student_id) != student_id:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status not in {"issued", "awaiting_payment"}:
        raise HTTPException(status_code=409, detail="This invoice cannot accept a payment submission")
    method = (await db.execute(select(PaymentMethod).where(PaymentMethod.id == data.payment_method_id, PaymentMethod.is_active.is_(True)))).scalar_one_or_none()
    if not method:
        raise HTTPException(status_code=400, detail="Payment method is not available")
    path = data.receipt_storage_path.strip()
    if path.startswith("/") or ".." in path or not path.startswith("payment-receipts/"):
        raise HTTPException(status_code=400, detail="Invalid receipt storage path")
    duplicate = (await db.execute(select(PaymentSubmission.id).where(PaymentSubmission.transfer_reference == data.transfer_reference))).scalar_one_or_none()
    if duplicate:
        raise HTTPException(status_code=409, detail="Transfer reference has already been submitted")
    submission = PaymentSubmission(invoice_id=invoice.id, payment_method_id=method.id, payer_name=data.payer_name.strip(), amount_claimed=data.amount_claimed, transfer_reference=data.transfer_reference.strip(), receipt_storage_path=path)
    invoice.status = "under_verification"
    db.add(submission)
    await db.flush()
    return submission


async def decide_payment(db: AsyncSession, submission_id: uuid.UUID, verifier_id: str, approved: bool, reason: str | None) -> PaymentSubmission:
    submission = (await db.execute(select(PaymentSubmission).where(PaymentSubmission.id == submission_id).with_for_update())).scalar_one_or_none()
    if not submission or submission.status not in {"submitted", "under_review"}:
        raise HTTPException(status_code=404, detail="Pending payment submission not found")
    invoice = (await db.execute(select(Invoice).where(Invoice.id == submission.invoice_id).with_for_update())).scalar_one()
    if approved and submission.amount_claimed != invoice.amount_due:
        raise HTTPException(status_code=422, detail="Claimed amount does not match the invoice")
    if not approved and not (reason or "").strip():
        raise HTTPException(status_code=422, detail="A rejection reason is required")
    submission.status = "approved" if approved else "rejected"
    invoice.status = "paid" if approved else "awaiting_payment"
    db.add(PaymentVerification(submission_id=submission.id, verifier_id=uuid.UUID(verifier_id), decision=submission.status, reason=(reason or "").strip() or None))
    if approved:
        enrollment = (await db.execute(select(StudentEnrollment).where(StudentEnrollment.student_id == invoice.student_id, StudentEnrollment.course_id == invoice.course_id).with_for_update())).scalar_one_or_none()
        if enrollment:
            enrollment.status, enrollment.has_platform_access = "enrolled", True
        else:
            db.add(StudentEnrollment(student_id=invoice.student_id, course_id=invoice.course_id, batch=1, status="enrolled", has_platform_access=True))
    await db.flush()
    return submission
