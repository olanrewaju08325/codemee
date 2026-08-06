from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, insert
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.certificate import Certificate, CertificateTemplate
from app.models.quiz import QuizAttempt
from app.schemas.certificate import (
    CertificateResponse,
    CertificateCreate,
    CertificateTemplateResponse,
    CertificateTemplateUpsert
)
from app.services.push_service import queue_push

async def get_user_certificates(db: AsyncSession, user_id: str) -> List[CertificateResponse]:
    """Get all certificates for a user."""
    result = await db.execute(
        select(Certificate)
        .where(Certificate.student_id == user_id)
        .order_by(Certificate.issued_at.desc())
    )
    certificates = result.scalars().all()

    return [
        CertificateResponse(
            id=str(c.id),
            student_id=str(c.student_id),
            course_id=c.course_id,
            certificate_code=c.certificate_code,
            issued_at=c.issued_at
        )
        for c in certificates
    ]

async def get_certificate_by_id(db: AsyncSession, certificate_id: str) -> Optional[CertificateResponse]:
    """Get a specific certificate by ID."""
    result = await db.execute(
        select(Certificate).where(Certificate.id == certificate_id)
    )
    certificate = result.scalar_one_or_none()

    if not certificate:
        return None

    return CertificateResponse(
        id=str(certificate.id),
        student_id=str(certificate.student_id),
        course_id=certificate.course_id,
        certificate_code=certificate.certificate_code,
        issued_at=certificate.issued_at
    )

async def check_certificate_eligibility(db: AsyncSession, user_id: str, course_id: str) -> dict:
    """
    Check if user is eligible for a certificate based on quiz passes.
    Replaces: App.tsx lines 131-152 and CertificateView.tsx
    """
    from app.models.course import Module
    from app.models.quiz import Quiz

    result = await db.execute(
        select(Quiz.id)
        .join(Module, Quiz.module_id == Module.id)
        .where(Module.course_id == course_id)
    )
    course_quiz_ids = [str(q[0]) for q in result.all()]

    total_quizzes = len(course_quiz_ids)

    result = await db.execute(
        select(QuizAttempt.quiz_id)
        .where(QuizAttempt.student_id == user_id)
        .where(QuizAttempt.passed == True)
        .where(QuizAttempt.quiz_id.in_(course_quiz_ids))
        .distinct()
    )

    passed_quiz_ids = result.scalars().all()
    passed_count = len(passed_quiz_ids)

    return {
        "eligible": passed_count >= total_quizzes,
        "passed_quizzes": passed_count,
        "total_quizzes": total_quizzes
    }

async def generate_certificate_code() -> str:
    """Generate a unique certificate code."""
    year = datetime.now().year
    import random
    random_num = random.randint(100000, 999999)
    return f"CME-{year}-{random_num}"

async def issue_certificate(
    db: AsyncSession,
    user_id: str,
    course_id: str
) -> CertificateResponse:
    """
    Issue a certificate to a user.
    Replaces: CertificateView.tsx lines 64-96
    """
    existing = await db.execute(
        select(Certificate)
        .where(Certificate.student_id == user_id)
        .where(Certificate.course_id == course_id)
    )
    if existing.scalar_one_or_none():
        raise ValueError("User already has a certificate for this course")

    eligibility = await check_certificate_eligibility(db, user_id, course_id)
    if not eligibility["eligible"]:
        raise ValueError("User is not eligible for certificate")

    certificate_code = await generate_certificate_code()

    certificate = Certificate(
        student_id=user_id,
        course_id=course_id,
        certificate_code=certificate_code
    )
    db.add(certificate)
    await db.commit()
    await db.refresh(certificate)

    queue_push(
        user_id,
        "Certificate Issued",
        f"Congratulations! Your certificate for {course_id} has been issued.",
        {"url": "/", "tag": f"certificate:{certificate.id}"},
        category="certificate",
    )

    return CertificateResponse(
        id=str(certificate.id),
        student_id=str(certificate.student_id),
        course_id=certificate.course_id,
        certificate_code=certificate.certificate_code,
        issued_at=certificate.issued_at
    )

async def get_all_certificates(db: AsyncSession) -> List[CertificateResponse]:
    """Get all certificates (for admin)."""
    result = await db.execute(
        select(Certificate).order_by(Certificate.issued_at.desc())
    )
    certificates = result.scalars().all()

    return [
        CertificateResponse(
            id=str(c.id),
            student_id=str(c.student_id),
            course_id=c.course_id,
            certificate_code=c.certificate_code,
            issued_at=c.issued_at
        )
        for c in certificates
    ]

# Certificate templates

async def get_certificate_templates(db: AsyncSession) -> List[CertificateTemplateResponse]:
    """Get all certificate templates."""
    result = await db.execute(
        select(CertificateTemplate).order_by(CertificateTemplate.course_id)
    )
    templates = result.scalars().all()

    return [
        CertificateTemplateResponse(
            id=str(t.id),
            course_id=t.course_id,
            template_name=t.template_name,
            primary_color=t.primary_color,
            accent_color=t.accent_color,
            logo_url=t.logo_url,
            signatory_name=t.signatory_name,
            signatory_title=t.signatory_title,
            custom_css=t.custom_css,
            is_active=t.is_active,
            created_at=t.created_at
        )
        for t in templates
    ]

async def upsert_certificate_template(
    db: AsyncSession,
    template_data: CertificateTemplateUpsert,
    created_by: Optional[str] = None
) -> CertificateTemplateResponse:
    """Insert or update a certificate template for a course."""
    result = await db.execute(
        select(CertificateTemplate).where(CertificateTemplate.course_id == template_data.course_id)
    )
    existing = result.scalar_one_or_none()

    values = {
        "template_name": template_data.template_name,
        "primary_color": template_data.primary_color,
        "accent_color": template_data.accent_color,
        "logo_url": template_data.logo_url,
        "signatory_name": template_data.signatory_name,
        "signatory_title": template_data.signatory_title,
        "custom_css": template_data.custom_css,
        "is_active": template_data.is_active,
    }

    if existing:
        await db.execute(
            update(CertificateTemplate)
            .where(CertificateTemplate.course_id == template_data.course_id)
            .values(**{k: v for k, v in values.items() if v is not None})
        )
        await db.commit()
        template_id = existing.id
    else:
        template = CertificateTemplate(
            course_id=template_data.course_id,
            created_by=created_by,
            **values
        )
        db.add(template)
        await db.commit()
        await db.refresh(template)
        template_id = template.id

    result = await db.execute(
        select(CertificateTemplate).where(CertificateTemplate.id == template_id)
    )
    t = result.scalar_one()

    return CertificateTemplateResponse(
        id=str(t.id),
        course_id=t.course_id,
        template_name=t.template_name,
        primary_color=t.primary_color,
        accent_color=t.accent_color,
        logo_url=t.logo_url,
        signatory_name=t.signatory_name,
        signatory_title=t.signatory_title,
        custom_css=t.custom_css,
        is_active=t.is_active,
        created_at=t.created_at
    )
