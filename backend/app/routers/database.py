import time

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role

router = APIRouter(prefix="/api/admin/database", tags=["Database Administration"])


@router.get("/health")
async def get_database_health(db: AsyncSession = Depends(get_db), _user=Depends(require_role(["admin"]))):
    """Minimal, non-sensitive database health information for the administrator."""
    started = time.perf_counter()
    await db.execute(text("SELECT 1"))
    counts = {}
    for table in ("profiles", "courses", "student_enrollments", "invoices", "payment_submissions", "certificates"):
        counts[table] = int((await db.execute(text(f"SELECT count(*) FROM {table}"))).scalar() or 0)
    return {
        "status": "healthy",
        "ping_ms": round((time.perf_counter() - started) * 1000, 2),
        "row_counts": counts,
        "last_backup": "Managed by Supabase",
    }
