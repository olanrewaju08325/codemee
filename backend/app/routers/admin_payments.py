from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from app.models.payment import ExamPaymentVerification
from sqlalchemy import select

router = APIRouter(prefix="/api/admin/payments", tags=["Admin Operations"])

@router.get("/pending")
def get_pending_payments(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns a list of pending manual payments.
    """
    payments = db.execute(select(ExamPaymentVerification).where(ExamPaymentVerification.status == "pending")).scalars().all()
    return [{"id": str(p.id), "student_id": str(p.student_id), "status": p.status, "receipt_url": getattr(p, "receipt_url", None)} for p in payments]

