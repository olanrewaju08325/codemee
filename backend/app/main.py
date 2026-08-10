from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.routers import enrollment, courses, quizzes, certificates, forum, lessons, payments, announcements, admin, notifications, push, cron, ai, analytics, health, audit_logs, database, student_dashboard, teacher_dashboard, teacher_ai, admin_dashboard, admin_users, admin_courses, admin_system, admin_monitoring, commerce, support, admin_staff, password_reset, public_config, chat
from app.routers import auth
import logging

# Configure production-ready logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CodeMe Academy API",
    description="Backend API for CodeMe Academy learning platform",
    version="1.0.3"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_trace = traceback.format_exc()
    logger.error(f"Global exception caught: {type(exc).__name__}: {str(exc)}\n{error_trace}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error_type": type(exc).__name__,
            "error_msg": str(exc),
            "trace": error_trace
        },
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")}
    )

app.include_router(health.router)

# Router registration
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(password_reset.router, tags=["Password Reset"])
app.include_router(public_config.router, tags=["Public"])
app.include_router(enrollment.router, prefix="/api", tags=["Enrollment"])
app.include_router(courses.router, prefix="/api", tags=["Courses"])
app.include_router(quizzes.router, prefix="/api", tags=["Quizzes"])
app.include_router(certificates.router, prefix="/api", tags=["Certificates"])
app.include_router(forum.router, prefix="/api", tags=["Forum"])
app.include_router(lessons.router, prefix="/api", tags=["Lessons"])
app.include_router(payments.router, prefix="/api", tags=["Payments"])
app.include_router(announcements.router, prefix="/api", tags=["Announcements"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(notifications.router, prefix="/api", tags=["Notifications"])
app.include_router(push.router, prefix="/api", tags=["Push"])
app.include_router(cron.router, prefix="/api", tags=["Cron"])
app.include_router(ai.router, prefix="/api", tags=["AI"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(audit_logs.router)
app.include_router(database.router)
from app.routers import admin_batches, admin_settings
app.include_router(admin_batches.router)
app.include_router(admin_settings.router)
app.include_router(student_dashboard.router)
app.include_router(teacher_dashboard.router)
app.include_router(teacher_ai.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_users.router)
app.include_router(admin_courses.router)
app.include_router(admin_system.router)
app.include_router(admin_monitoring.router)
app.include_router(commerce.router, prefix="/api")
app.include_router(support.router, prefix="/api")
app.include_router(admin_staff.router)
app.include_router(chat.router, prefix="/api")
@app.on_event("startup")
async def startup():
    pass

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
