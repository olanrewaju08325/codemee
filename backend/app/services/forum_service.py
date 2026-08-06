from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import Optional, List, Dict, Any
from app.models.forum import ForumPost, ForumReply
from app.models.profile import Profile
from app.schemas.forum import (
    ForumPostResponse,
    ForumPostCreate,
    ForumPostUpdate,
    ForumReplyResponse,
    ForumReplyCreate,
    ForumReplyUpdate
)

def _author_info(profile: Optional[Profile]) -> Optional[Dict[str, Any]]:
    if not profile:
        return None
    return {
        "full_name": profile.full_name,
        "student_id": profile.student_id,
        "role": profile.role,
        "avatar_url": profile.avatar_url,
    }

async def _build_post_response(db: AsyncSession, post: ForumPost, with_replies: bool = False) -> ForumPostResponse:
    author = await db.execute(
        select(Profile).where(Profile.id == post.student_id)
    )
    profile = author.scalar_one_or_none()

    replies = None
    if with_replies and post.replies:
        replies = await get_post_replies(db, str(post.id))

    return ForumPostResponse(
        id=str(post.id),
        course_id=post.course_id,
        student_id=str(post.student_id),
        content=post.content,
        status=post.status,
        is_pinned=post.is_pinned,
        is_deleted=post.is_deleted,
        created_at=post.created_at,
        author=_author_info(profile),
        replies=replies
    )

async def get_all_forum_posts(db: AsyncSession, course_id: Optional[str] = None) -> List[ForumPostResponse]:
    """Get all approved, non-deleted forum posts, optionally filtered by course."""
    query = (
        select(ForumPost)
        .where(ForumPost.is_deleted == False)
        .where(ForumPost.status == "approved")
        .order_by(ForumPost.is_pinned.desc(), ForumPost.created_at.desc())
    )
    if course_id:
        query = query.where(ForumPost.course_id == course_id)

    result = await db.execute(query)
    posts = result.scalars().all()

    return [await _build_post_response(db, p) for p in posts]

async def get_held_forum_posts(db: AsyncSession) -> List[ForumPostResponse]:
    """Get all held (pending moderation) forum posts."""
    result = await db.execute(
        select(ForumPost)
        .where(ForumPost.status == "held")
        .where(ForumPost.is_deleted == False)
        .order_by(ForumPost.created_at.desc())
    )
    posts = result.scalars().all()

    return [await _build_post_response(db, p) for p in posts]

async def get_forum_post_by_id(db: AsyncSession, post_id: str) -> Optional[ForumPostResponse]:
    """Get a specific forum post with its replies."""
    result = await db.execute(
        select(ForumPost)
        .options(selectinload(ForumPost.replies))
        .where(ForumPost.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        return None

    return await _build_post_response(db, post, with_replies=True)

async def create_forum_post(db: AsyncSession, user_id: str, post_data: ForumPostCreate) -> ForumPostResponse:
    """Create a new forum post."""
    post = ForumPost(
        student_id=user_id,
        course_id=post_data.course_id,
        content=post_data.content,
        status="approved",
        is_pinned=False,
        is_deleted=False
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    return await _build_post_response(db, post)

async def update_forum_post(
    db: AsyncSession,
    post_id: str,
    user_id: str,
    role: str,
    post_data: ForumPostUpdate
) -> Optional[ForumPostResponse]:
    """
    Update an existing forum post.
    Authors may edit content; teachers/admins may pin/unpin any post.
    """
    result = await db.execute(
        select(ForumPost).where(ForumPost.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        return None

    update_data: Dict[str, Any] = {}
    if post_data.content is not None:
        if str(post.student_id) != user_id and role not in ("admin", "teacher"):
            return None
        update_data["content"] = post_data.content
    if post_data.is_pinned is not None:
        if role not in ("admin", "teacher"):
            return None
        update_data["is_pinned"] = post_data.is_pinned

    if update_data:
        await db.execute(
            update(ForumPost).where(ForumPost.id == post_id).values(**update_data)
        )
        await db.commit()

    return await get_forum_post_by_id(db, post_id)

async def delete_forum_post(db: AsyncSession, post_id: str, user_id: str, role: str) -> bool:
    """Soft-delete a forum post (author or teacher/admin)."""
    result = await db.execute(
        select(ForumPost).where(ForumPost.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        return False

    if str(post.student_id) != user_id and role not in ("admin", "teacher"):
        return False

    await db.execute(
        update(ForumPost)
        .where(ForumPost.id == post_id)
        .values(is_deleted=True, deleted_by=user_id)
    )
    await db.commit()
    return True

async def moderate_forum_post(db: AsyncSession, post_id: str, status: str) -> Optional[ForumPostResponse]:
    """Set moderation status on a forum post (approved or held)."""
    if status not in ("approved", "held"):
        return None

    result = await db.execute(
        select(ForumPost).where(ForumPost.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        return None

    await db.execute(
        update(ForumPost).where(ForumPost.id == post_id).values(status=status)
    )
    await db.commit()

    return await get_forum_post_by_id(db, post_id)

async def get_post_replies(db: AsyncSession, post_id: str) -> List[ForumReplyResponse]:
    """Get all replies for a post."""
    result = await db.execute(
        select(ForumReply)
        .where(ForumReply.post_id == post_id)
        .order_by(ForumReply.created_at)
    )
    replies = result.scalars().all()

    return [await _build_reply_response(db, r) for r in replies]

async def _build_reply_response(db: AsyncSession, reply: ForumReply) -> ForumReplyResponse:
    author = await db.execute(
        select(Profile).where(Profile.id == reply.user_id)
    )
    profile = author.scalar_one_or_none()

    return ForumReplyResponse(
        id=str(reply.id),
        post_id=str(reply.post_id),
        user_id=str(reply.user_id),
        content=reply.content,
        created_at=reply.created_at,
        author=_author_info(profile)
    )

async def create_forum_reply(db: AsyncSession, post_id: str, user_id: str, reply_data: ForumReplyCreate) -> ForumReplyResponse:
    """Create a new forum reply."""
    reply = ForumReply(
        post_id=post_id,
        user_id=user_id,
        content=reply_data.content
    )
    db.add(reply)
    await db.commit()
    await db.refresh(reply)

    return await _build_reply_response(db, reply)

async def update_forum_reply(db: AsyncSession, reply_id: str, user_id: str, role: str, reply_data: ForumReplyUpdate) -> Optional[ForumReplyResponse]:
    """Update an existing forum reply (only by author)."""
    result = await db.execute(
        select(ForumReply).where(ForumReply.id == reply_id)
    )
    reply = result.scalar_one_or_none()

    if not reply:
        return None

    if str(reply.user_id) != user_id and role not in ("admin", "teacher"):
        return None

    await db.execute(
        update(ForumReply).where(ForumReply.id == reply_id).values(content=reply_data.content)
    )
    await db.commit()

    return await _build_reply_response(db, reply)

async def delete_forum_reply(db: AsyncSession, reply_id: str, user_id: str, role: str) -> bool:
    """Delete a forum reply (only by author or teacher/admin)."""
    result = await db.execute(
        select(ForumReply).where(ForumReply.id == reply_id)
    )
    reply = result.scalar_one_or_none()

    if not reply:
        return False

    if str(reply.user_id) != user_id and role not in ("admin", "teacher"):
        return False

    await db.execute(
        delete(ForumReply).where(ForumReply.id == reply_id)
    )
    await db.commit()
    return True
