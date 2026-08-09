from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.admin_setting import AdminSetting
from app.schemas.admin_setting import AdminSettingResponse, AdminSettingUpdate


router = APIRouter(prefix="/api/admin/settings", tags=["Admin Settings"])


@router.get("/", response_model=List[AdminSettingResponse])
async def get_all_settings(
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    """Return editable academy settings to an authenticated administrator."""
    result = await db.execute(select(AdminSetting).order_by(AdminSetting.setting_key))
    return result.scalars().all()


@router.patch("/{setting_key}", response_model=AdminSettingResponse)
async def update_setting(
    setting_key: str,
    update_data: AdminSettingUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(["admin"])),
):
    """Update one non-secret academy setting."""
    result = await db.execute(
        select(AdminSetting).where(AdminSetting.setting_key == setting_key).with_for_update()
    )
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    values = update_data.model_dump(exclude_unset=True)
    for field, value in values.items():
        setattr(setting, field, value)
    await db.commit()
    await db.refresh(setting)
    return setting
