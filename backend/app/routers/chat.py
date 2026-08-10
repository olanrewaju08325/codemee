from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.core.security import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    content: str
    read_at: Optional[datetime]
    created_at: datetime
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None

class SendMessageRequest(BaseModel):
    receiver_id: str
    content: str

@router.get("/conversations", response_model=List[dict])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get list of users you have chatted with."""
    from app.database import get_supabase
    client = get_supabase()
    
    # We find all unique users the current user has sent to or received from
    res = client.table("direct_messages").select("sender_id, receiver_id").or_(f"sender_id.eq.{current_user['id']},receiver_id.eq.{current_user['id']}").execute()
    
    contact_ids = set()
    for msg in res.data:
        if msg['sender_id'] != current_user['id']:
            contact_ids.add(msg['sender_id'])
        if msg['receiver_id'] != current_user['id']:
            contact_ids.add(msg['receiver_id'])
            
    if not contact_ids:
        return []
        
    # Fetch profiles for these contacts
    profiles_res = client.table("profiles").select("id, full_name, role, avatar_url").in_("id", list(contact_ids)).execute()
    return profiles_res.data

@router.get("/history/{contact_id}", response_model=List[ChatMessage])
async def get_chat_history(contact_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages between current user and a specific contact."""
    from app.database import get_supabase
    client = get_supabase()
    
    uid = current_user['id']
    res = client.table("direct_messages").select("*, sender:profiles!direct_messages_sender_id_fkey(full_name), receiver:profiles!direct_messages_receiver_id_fkey(full_name)").or_(
        f"and(sender_id.eq.{uid},receiver_id.eq.{contact_id}),and(sender_id.eq.{contact_id},receiver_id.eq.{uid})"
    ).order("created_at", desc=False).execute()
    
    messages = []
    for row in res.data:
        messages.append(ChatMessage(
            id=row['id'],
            sender_id=row['sender_id'],
            receiver_id=row['receiver_id'],
            content=row['content'],
            read_at=row.get('read_at'),
            created_at=row['created_at'],
            sender_name=row.get('sender', {}).get('full_name') if row.get('sender') else None,
            receiver_name=row.get('receiver', {}).get('full_name') if row.get('receiver') else None
        ))
    return messages

@router.post("/send", response_model=ChatMessage)
async def send_message(req: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    """Send a new message."""
    from app.database import get_supabase
    client = get_supabase()
    
    data = {
        "sender_id": current_user['id'],
        "receiver_id": req.receiver_id,
        "content": req.content
    }
    
    res = client.table("direct_messages").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to send message")
        
    row = res.data[0]
    return ChatMessage(
        id=row['id'],
        sender_id=row['sender_id'],
        receiver_id=row['receiver_id'],
        content=row['content'],
        read_at=row.get('read_at'),
        created_at=row['created_at']
    )

@router.post("/mark-read/{sender_id}")
async def mark_messages_read(sender_id: str, current_user: dict = Depends(get_current_user)):
    """Mark messages from a sender as read."""
    from app.database import get_supabase
    from datetime import datetime
    client = get_supabase()
    
    res = client.table("direct_messages") \
        .update({"read_at": datetime.utcnow().isoformat()}) \
        .eq("sender_id", sender_id) \
        .eq("receiver_id", current_user['id']) \
        .is_("read_at", "null") \
        .execute()
        
    return {"success": True, "marked_count": len(res.data)}
