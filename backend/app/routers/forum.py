from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_teacher_or_admin
from app.services.forum_service import (
    get_all_forum_posts,
    get_forum_post_by_id,
    create_forum_post,
    update_forum_post,
    delete_forum_post,
    moderate_forum_post,
    get_held_forum_posts,
    get_post_replies,
    create_forum_reply,
    update_forum_reply,
    delete_forum_reply
)
from app.schemas.forum import (
    ForumPostResponse,
    ForumPostCreate,
    ForumPostUpdate,
    ForumModerationUpdate,
    ForumReplyResponse,
    ForumReplyCreate,
    ForumReplyUpdate
)
from typing import Dict, Any, Optional

router = APIRouter()

# Forum post endpoints

@router.get("/forum/posts", response_model=list[ForumPostResponse])
async def list_forum_posts(
    course_id: Optional[str] = Query(None, description="Filter by course id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all approved forum posts, optionally filtered by course.
    Replaces: ForumView.tsx lines 42-52
    """
    posts = await get_all_forum_posts(db, course_id)
    return posts

@router.get("/forum/posts/{post_id}", response_model=ForumPostResponse)
async def get_forum_post(
    post_id: str,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific forum post with its replies.
    """
    post = await get_forum_post_by_id(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post

@router.post("/forum/posts", response_model=ForumPostResponse)
async def create_forum_post_endpoint(
    post_data: ForumPostCreate,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new forum post.
    Replaces: ForumView.tsx lines 77-95
    """
    post = await create_forum_post(db, user_data["user_id"], post_data)
    return post

@router.patch("/forum/posts/{post_id}", response_model=ForumPostResponse)
async def update_forum_post_endpoint(
    post_id: str,
    post_data: ForumPostUpdate,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing forum post (author edits content; teachers/admins pin).
    Replaces: ForumView.tsx lines 115-120
    """
    post = await update_forum_post(db, post_id, user_data["user_id"], user_data["role"], post_data)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    return post

@router.delete("/forum/posts/{post_id}")
async def delete_forum_post_endpoint(
    post_id: str,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Soft-delete a forum post (author or teacher/admin).
    Replaces: ForumView.tsx lines 122-128
    """
    success = await delete_forum_post(db, post_id, user_data["user_id"], user_data["role"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    return {"status": "success", "message": "Post deleted"}

# Forum reply endpoints

@router.get("/forum/posts/{post_id}/replies", response_model=list[ForumReplyResponse])
async def get_post_replies_endpoint(
    post_id: str,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all replies for a post.
    Replaces: ForumView.tsx lines 54-64
    """
    replies = await get_post_replies(db, post_id)
    return replies

@router.post("/forum/posts/{post_id}/replies", response_model=ForumReplyResponse)
async def create_forum_reply_endpoint(
    post_id: str,
    reply_data: ForumReplyCreate,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new forum reply.
    Replaces: ForumView.tsx lines 97-113
    """
    reply = await create_forum_reply(db, post_id, user_data["user_id"], reply_data)
    return reply

@router.patch("/forum/replies/{reply_id}", response_model=ForumReplyResponse)
async def update_forum_reply_endpoint(
    reply_id: str,
    reply_data: ForumReplyUpdate,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing forum reply (only by author).
    """
    reply = await update_forum_reply(db, reply_id, user_data["user_id"], user_data["role"], reply_data)
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found or not authorized"
        )
    return reply

@router.delete("/forum/replies/{reply_id}")
async def delete_forum_reply_endpoint(
    reply_id: str,
    user_data: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a forum reply (only by author or teacher/admin).
    """
    success = await delete_forum_reply(db, reply_id, user_data["user_id"], user_data["role"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found or not authorized"
        )
    return {"status": "success", "message": "Reply deleted"}

# Admin / Teacher moderation endpoints

@router.get("/admin/forum/held", response_model=list[ForumPostResponse])
async def get_held_posts_endpoint(
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all held (pending moderation) forum posts.
    Replaces: AdminPortal.tsx lines 312-321
    """
    posts = await get_held_forum_posts(db)
    return posts

@router.patch("/admin/forum/posts/{post_id}", response_model=ForumPostResponse)
async def moderate_post_endpoint(
    post_id: str,
    moderation_data: ForumModerationUpdate,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Approve or hold a forum post.
    Replaces: AdminPortal.tsx lines 405-410
    """
    post = await moderate_forum_post(db, post_id, moderation_data.status)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post

@router.delete("/admin/forum/posts/{post_id}")
async def admin_delete_post_endpoint(
    post_id: str,
    user_data: Dict[str, Any] = Depends(require_teacher_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin delete a forum post (soft delete).
    Replaces: AdminPortal.tsx lines 411-414
    """
    success = await delete_forum_post(db, post_id, user_data["user_id"], user_data["role"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return {"status": "success", "message": "Post deleted"}
