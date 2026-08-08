from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Dict, Any
from app.database import get_db
from app.core.security import require_role
from app.models.certificate import Certificate
from app.models.course import AssignmentSubmission, Assignment, Module
from app.schemas.certificate import CertificateResponse
import uuid
import datetime

router = APIRouter(prefix="/api/student/certificates", tags=["Student Certificates"])

@router.post("/claim/{course_id}", response_model=CertificateResponse)
def claim_certificate(
    course_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role(["student"]))
):
    """
    Issue a certificate if the student's final project is approved.
    """
    # 1. Check if they already have one
    existing = db.execute(
        select(Certificate)
        .where(Certificate.student_id == user["user_id"])
        .where(Certificate.course_id == course_id)
    ).scalar_one_or_none()
    
    if existing:
        return CertificateResponse(
            id=str(existing.id),
            student_id=str(existing.student_id),
            course_id=existing.course_id,
            certificate_code=existing.certificate_code,
            issued_at=existing.issued_at
        )
        
    # 2. Check if they have an approved final project for this course
    # Assuming final projects are marked by their name or being the last module assignment
    approved_submission = db.execute(
        select(AssignmentSubmission)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .join(Module, Assignment.module_id == Module.id)
        .where(AssignmentSubmission.student_id == user["user_id"])
        .where(AssignmentSubmission.status == "approved")
        .where(Module.course_id == course_id)
        .order_by(Module.order_index.desc())
        .limit(1)
    ).scalar_one_or_none()
    
    if not approved_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must have an approved final project to claim your certificate."
        )
        
    # 3. Issue certificate
    year = datetime.datetime.now().year
    import random
    random_num = random.randint(100000, 999999)
    certificate_code = f"CME-{year}-{random_num}"
    
    certificate = Certificate(
        student_id=user["user_id"],
        course_id=course_id,
        certificate_code=certificate_code
    )
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    
    return CertificateResponse(
        id=str(certificate.id),
        student_id=str(certificate.student_id),
        course_id=certificate.course_id,
        certificate_code=certificate.certificate_code,
        issued_at=certificate.issued_at
    )
