import logging
import platform

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

router = APIRouter(prefix="/api", tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Deployment-safe health signal without exposing secrets or tracebacks."""
    result = {
        "status": "healthy",
        "version": "1.0.0",
        "database": "unknown",
        "ai_service": "configured" if settings.AI_PROVIDER != "mock" and settings.GROQ_API_KEYS else "disabled",
        "storage": "configured" if settings.SUPABASE_PROJECT_URL and settings.SUPABASE_SERVICE_ROLE_KEY else "unconfigured",
        "system": {"os": platform.system(), "python_version": platform.python_version()},
    }
    try:
        await db.execute(text("SELECT 1"))
        result["database"] = "healthy"
    except Exception:
        logger.exception("Database health check failed")
        result["database"] = "unhealthy"
        result["status"] = "degraded"

    if result["database"] == "unhealthy" or result["storage"] == "unconfigured":
        raise HTTPException(status_code=503, detail=result)
    return result
