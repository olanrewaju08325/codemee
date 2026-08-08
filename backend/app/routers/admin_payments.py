from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import require_role
from app.models.payment import ExamPaymentVerification
from app.routers.audit_logs import create_audit_log
from sqlalchemy import select

router = APIRouter(prefix="/api/admin/payments", tags=["Admin Operations"])

@router.get("/pending")
def get_pending_payments(db: Session = Depends(get_db), user=Depends(require_role(["admin"]))):
    """
    Returns a list of pending manual payments.
    """
    payments = db.execute(select(ExamPaymentVerification).where(ExamPaymentVerification.status == "pending")).scalars().all()
    return [{"id": str(p.id), "student_id": str(p.student_id), "status": p.status, "receipt_url": getattr(p, "receipt_url", None)} for p in payments]

from pydantic import BaseModel
from fastapi import HTTPException

class PaymentUpdate(BaseModel):
    status: str
    rejection_reason: str = None

@router.patch("/{payment_id}")
def update_payment(payment_id: str, update_data: PaymentUpdate, db: Session = Depends(get_db), user=Depends(require_role(["admin", "ADMIN"]))):
    payment = db.query(ExamPaymentVerification).filter(ExamPaymentVerification.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = update_data.status
    if update_data.rejection_reason:
        payment.rejection_reason = update_data.rejection_reason
    
    db.commit()
    db.refresh(payment)
    
    create_audit_log(
        db=db,
        admin_id=user["user_id"],
        action="UPDATE_PAYMENT",
        target_object=payment_id,
        admin_name=user.get("email"),
        details=f"Updated payment status to {update_data.status}"
    )
    
    return {"success": True, "status": payment.status}
