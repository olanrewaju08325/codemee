from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings
import logging
import platform

router = APIRouter(prefix="/api", tags=["health"])
logger = logging.getLogger(__name__)

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check for deployment validation and internal infrastructure dashboard.
    """
    status = {
        "status": "healthy",
        "version": "1.0.0",
        "database": "unknown",
        "ai_service": "unknown",
        "storage": "unknown",
        "system": {
            "os": platform.system(),
            "python_version": platform.python_version()
        }
    }

    # 1. Check Database
    try:
        db.execute(text("SELECT 1"))
        status["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        status["database"] = "unhealthy"
        status["status"] = "degraded"

    # 2. Check AI Service configuration
    if settings.GROQ_API_KEYS:
        status["ai_service"] = "configured"
    else:
        logger.warning("AI Service health check failed: Missing GROQ_API_KEYS")
        status["ai_service"] = "unhealthy"
        status["status"] = "degraded"

    # 3. Check Storage / Supabase configuration
    if settings.SUPABASE_PROJECT_URL and settings.SUPABASE_JWT_SECRET:
        status["storage"] = "configured"
    else:
        logger.warning("Storage health check failed: Missing Supabase credentials")
        status["storage"] = "unhealthy"
        status["status"] = "degraded"

    if status["status"] == "degraded":
        # Return 503 Service Unavailable if critical infrastructure is down
        # This will fail the deployment health check
        raise HTTPException(status_code=503, detail=status)

    return status

