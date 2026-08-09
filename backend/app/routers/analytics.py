import csv
from io import StringIO

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.schemas.analytics import AdminAnalyticsResponse, StudentAnalyticsResponse, TeacherAnalyticsResponse
from app.services.analytics_service import get_admin_analytics, get_student_analytics, get_teacher_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/student/me", response_model=StudentAnalyticsResponse)
async def read_student_analytics(user=Depends(require_role(["student", "admin"])), db: AsyncSession = Depends(get_db)):
    return await get_student_analytics(db, user["user_id"])


@router.get("/teacher/me", response_model=TeacherAnalyticsResponse)
async def read_teacher_analytics(user=Depends(require_role(["teacher", "admin"])), db: AsyncSession = Depends(get_db)):
    return await get_teacher_analytics(db, user["user_id"])


@router.get("/admin/overview", response_model=AdminAnalyticsResponse)
async def read_admin_analytics(_user=Depends(require_role(["admin"])), db: AsyncSession = Depends(get_db)):
    return await get_admin_analytics(db)


@router.get("/export")
async def export_analytics(
    type: str = Query(..., pattern="^(students|revenue)$"),
    _user=Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    stats = await get_admin_analytics(db)
    output = StringIO()
    writer = csv.writer(output)
    if type == "revenue":
        writer.writerow(["Metric", "Value"])
        for key, value in stats["financial_dashboard"].items():
            writer.writerow([key, value])
    else:
        writer.writerow(["Metric", "Value"])
        for key, value in stats["platform_overview"].items():
            writer.writerow([key, value])
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=analytics_{type}.csv"})
