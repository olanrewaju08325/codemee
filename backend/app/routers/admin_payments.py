from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from app.models.payment import Payment
from sqlalchemy import select

router = APIRouter(prefix="/api/admin/payments", tags=["Admin Operations"])

@router.get("/pending")
def get_pending_payments(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns a list of pending manual payments.
    """
    payments = db.execute(select(Payment).where(Payment.status == "pending")).scalars().all()
    return [{"id": str(p.id), "amount": p.amount, "currency": p.currency, "method": p.method, "reference_id": p.reference_id} for p in payments]

