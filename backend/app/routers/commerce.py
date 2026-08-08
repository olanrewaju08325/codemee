from typing import Any, Dict, List
from uuid import UUID
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Request
import requests
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, require_admin
from app.core.permissions import require_admin
from app.models.commerce import Invoice, PaymentMethod, PaymentSubmission
from app.schemas.commerce import InvoiceCreate, InvoiceResponse, PaymentDecision, PaymentSubmissionCreate, PaymentSubmissionResponse
from app.services.commerce_service import create_invoice, decide_payment, submit_payment

router = APIRouter(prefix="/commerce", tags=["Course Commerce"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/payment-methods")
async def list_payment_methods(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PaymentMethod).where(PaymentMethod.is_active.is_(True)).order_by(PaymentMethod.display_order))
    return result.scalars().all()


@router.post("/invoices", response_model=InvoiceResponse)
async def issue_invoice(data: InvoiceCreate, user: Dict[str, Any] = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return await create_invoice(db, data, user["user_id"])


@router.get("/invoices/me", response_model=List[InvoiceResponse])
async def my_invoices(user: Dict[str, Any] = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.student_id == UUID(user["user_id"])).order_by(desc(Invoice.created_at)))
    return result.scalars().all()


@router.post("/invoices/{invoice_id}/submissions", response_model=PaymentSubmissionResponse)
@limiter.limit("5/hour")
async def create_payment_submission(request: Request, invoice_id: UUID, data: PaymentSubmissionCreate, user: Dict[str, Any] = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await submit_payment(db, invoice_id, user["user_id"], data)


@router.get("/admin/submissions", response_model=List[PaymentSubmissionResponse])
async def pending_submissions(user: Dict[str, Any] = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PaymentSubmission).where(PaymentSubmission.status.in_(("submitted", "under_review"))).order_by(PaymentSubmission.submitted_at))
    return result.scalars().all()


@router.get("/admin/submissions/{submission_id}/receipt-url")
async def signed_receipt_url(submission_id: UUID, user: Dict[str, Any] = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    submission = (await db.execute(select(PaymentSubmission).where(PaymentSubmission.id == submission_id))).scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Payment submission not found")
    path = submission.receipt_storage_path
    if not path.startswith("payment-receipts/") and not path.startswith("payment-receipts\\"):
        raise HTTPException(status_code=422, detail="Payment receipt has an invalid storage path")
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=503, detail="Receipt viewing is not configured")
    object_path = path.replace("\\", "/").removeprefix("payment-receipts/")
    url = f"{settings.SUPABASE_PROJECT_URL.rstrip('/')}/storage/v1/object/sign/payment-receipts/{quote(object_path, safe='/')}"
    try:
        response = requests.post(url, json={"expiresIn": 300}, headers={"Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}", "apikey": settings.SUPABASE_SERVICE_ROLE_KEY}, timeout=10)
        response.raise_for_status()
        signed_path = response.json().get("signedURL")
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Could not generate a receipt link")
    if not signed_path:
        raise HTTPException(status_code=502, detail="Receipt storage returned no signed link")
    return {"url": signed_path if signed_path.startswith("http") else f"{settings.SUPABASE_PROJECT_URL.rstrip('/')}/storage/v1{signed_path}", "expires_in": 300}


@router.post("/admin/submissions/{submission_id}/approve", response_model=PaymentSubmissionResponse)
async def approve_submission(submission_id: UUID, data: PaymentDecision, user: Dict[str, Any] = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return await decide_payment(db, submission_id, user["user_id"], True, data.reason)


@router.post("/admin/submissions/{submission_id}/reject", response_model=PaymentSubmissionResponse)
async def reject_submission(submission_id: UUID, data: PaymentDecision, user: Dict[str, Any] = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return await decide_payment(db, submission_id, user["user_id"], False, data.reason)
