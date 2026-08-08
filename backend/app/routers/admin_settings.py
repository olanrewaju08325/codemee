from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import require_role
from app.models.admin_setting import AdminSetting
from app.schemas.admin_setting import AdminSettingCreate, AdminSettingUpdate, AdminSettingResponse
from app.routers.audit_logs import create_audit_log

router = APIRouter(prefix="/api/admin/settings", tags=["Admin Settings"])

@router.get("/", response_model=List[AdminSettingResponse])
def get_all_settings(db: Session = Depends(get_db)):
    """Public endpoint to read settings like whatsapp links and payment instructions."""
    settings = db.query(AdminSetting).all()
    return settings

@router.patch("/{setting_key}", response_model=AdminSettingResponse)
def update_setting(
    setting_key: str, 
    update_data: AdminSettingUpdate, 
    db: Session = Depends(get_db), 
    user=Depends(require_role(["ADMIN", "admin"]))
):
    """Admin endpoint to update settings."""
    setting = db.query(AdminSetting).filter(AdminSetting.setting_key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    if update_data.setting_value is not None:
        setting.setting_value = update_data.setting_value
    if update_data.description is not None:
        setting.description = update_data.description
        
    db.commit()
    db.refresh(setting)
    
    # Audit log
    create_audit_log(
        db=db,
        admin_id=user["user_id"],
        action="UPDATE_SETTING",
        target_object=setting_key,
        admin_name=user.get("email"),
        details=f"Updated setting {setting_key}"
    )
    
    return setting
