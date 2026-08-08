from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import desc, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_admin, require_teacher_or_admin
from app.core.security import get_current_user
from app.models.support import SupportTicket, TicketMessage
from app.schemas.support import TicketCreate, TicketReply, TicketResponse

router = APIRouter(prefix="/support", tags=["Support"])
limiter = Limiter(key_func=get_remote_address)
VALID_CATEGORIES = {"account", "enrollment", "payment", "technical", "academic", "certificate", "other"}
VALID_PRIORITIES = {"low", "medium", "high"}

@router.post("/tickets", response_model=TicketResponse)
@limiter.limit("10/day")
async def create_ticket(request: Request, data: TicketCreate, user: Dict[str, Any] = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if data.category not in VALID_CATEGORIES or data.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=422, detail="Invalid ticket category or priority")
    ticket = SupportTicket(student_id=UUID(user["user_id"]), title=data.title.strip(), category=data.category, priority=data.priority, course_id=data.course_id)
    db.add(ticket)
    await db.flush()
    db.add(TicketMessage(ticket_id=ticket.id, author_id=UUID(user["user_id"]), body=data.description.strip()))
    await db.flush()
    return ticket

@router.get("/tickets/me", response_model=List[TicketResponse])
async def my_tickets(user: Dict[str, Any] = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupportTicket).where(SupportTicket.student_id == UUID(user["user_id"])).order_by(desc(SupportTicket.created_at)))
    return result.scalars().all()

@router.get("/tickets/{ticket_id}/messages")
async def ticket_messages(ticket_id: UUID, user: Dict[str, Any] = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    ticket = (await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))).scalar_one_or_none()
    if not ticket or str(ticket.student_id) != user["user_id"]:
        raise HTTPException(status_code=404, detail="Ticket not found")
    result = await db.execute(select(TicketMessage).where(TicketMessage.ticket_id == ticket_id, TicketMessage.visibility == "student").order_by(TicketMessage.created_at))
    return result.scalars().all()

@router.get("/staff/tickets", response_model=List[TicketResponse])
async def staff_tickets(user: Dict[str, Any] = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupportTicket).where(SupportTicket.category != "academic", SupportTicket.status.notin_(("resolved", "closed"))).order_by(SupportTicket.created_at))
    return result.scalars().all()

@router.post("/staff/tickets/{ticket_id}/reply")
async def staff_reply(ticket_id: UUID, data: TicketReply, user: Dict[str, Any] = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    ticket = (await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id).with_for_update())).scalar_one_or_none()
    if not ticket or ticket.category == "academic":
        raise HTTPException(status_code=404, detail="Support ticket not found")
    ticket.owner_id, ticket.status = UUID(user["user_id"]), "waiting_on_student"
    if not ticket.first_response_at: ticket.first_response_at = datetime.now(timezone.utc)
    db.add(TicketMessage(ticket_id=ticket.id, author_id=UUID(user["user_id"]), body=data.body.strip()))
    await db.flush()
    return {"success": True}

@router.get("/teacher/tickets", response_model=List[TicketResponse])
async def teacher_tickets(user: Dict[str, Any] = Depends(require_teacher_or_admin), db: AsyncSession = Depends(get_db)):
    query = select(SupportTicket).where(SupportTicket.category == "academic", SupportTicket.status.notin_(("resolved", "closed")))
    if user["role"] != "admin":
        query = query.where(SupportTicket.course_id.in_(text("SELECT course_id FROM course_teachers WHERE teacher_id = :teacher_id").bindparams(teacher_id=user["user_id"])))
    result = await db.execute(query.order_by(SupportTicket.created_at))
    return result.scalars().all()

@router.post("/teacher/tickets/{ticket_id}/reply")
async def teacher_reply(ticket_id: UUID, data: TicketReply, user: Dict[str, Any] = Depends(require_teacher_or_admin), db: AsyncSession = Depends(get_db)):
    ticket = (await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id).with_for_update())).scalar_one_or_none()
    if not ticket or ticket.category != "academic":
        raise HTTPException(status_code=404, detail="Academic ticket not found")
    if user["role"] != "admin":
        assigned = await db.execute(text("SELECT 1 FROM course_teachers WHERE course_id = :course_id AND teacher_id = :teacher_id").bindparams(course_id=ticket.course_id, teacher_id=user["user_id"]))
        if not assigned.first():
            raise HTTPException(status_code=403, detail="You are not assigned to this course")
    ticket.owner_id, ticket.status = UUID(user["user_id"]), "waiting_on_student"
    if not ticket.first_response_at: ticket.first_response_at = datetime.now(timezone.utc)
    db.add(TicketMessage(ticket_id=ticket.id, author_id=UUID(user["user_id"]), body=data.body.strip()))
    await db.flush()
    return {"success": True}
