from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.content_version import ContentVersionHistory
import json

async def create_content_version(db: AsyncSession, entity_id: str, entity_type: str, author_id: str, snapshot: dict, change_summary: str):
    """
    Creates a new version record for a piece of content.
    """
    # Find latest version
    result = await db.execute(
        select(ContentVersionHistory)
        .where(ContentVersionHistory.entity_id == entity_id)
        .order_by(desc(ContentVersionHistory.version_number))
        .limit(1)
    )
    latest = result.scalar_one_or_none()
    next_version = 1 if not latest else latest.version_number + 1

    history = ContentVersionHistory(
        entity_id=entity_id,
        entity_type=entity_type,
        version_number=next_version,
        author_id=author_id,
        change_summary=change_summary,
        snapshot=json.dumps(snapshot)
    )
    db.add(history)
    await db.commit()
    return history

