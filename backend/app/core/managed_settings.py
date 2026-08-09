"""Academy contact settings that admins edit from the panel.

These live in the `admin_settings` table so the admin can change the support
WhatsApp number and email without a redeploy. The values are read by:
  - the admin Settings tab (GET /api/admin/settings/), which seeds the rows
    with the defaults below on first load, and
  - the public auth screen (GET /api/public/support-contact), which shows the
    WhatsApp/admin fallback when an automated reset email can't be delivered.

Defaults are the real academy contacts, so everything works even before an
admin ever opens the Settings tab.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin_setting import AdminSetting

SUPPORT_WHATSAPP_KEY = "support_whatsapp"
SUPPORT_EMAIL_KEY = "support_email"

# key -> (default value, human description shown in the admin Settings tab)
MANAGED_SETTINGS: dict[str, dict[str, str]] = {
    SUPPORT_WHATSAPP_KEY: {
        "default": "2349032517376",
        "description": (
            "WhatsApp number students are directed to for password-reset help. "
            "Digits only, full international format (e.g. 2349032517376)."
        ),
    },
    SUPPORT_EMAIL_KEY: {
        "default": "admitwise2@gmail.com",
        "description": "Support email address shown to students.",
    },
}


async def ensure_managed_settings(db: AsyncSession) -> None:
    """Create any missing managed rows using their defaults. Idempotent — safe
    to call on every admin Settings load."""
    result = await db.execute(select(AdminSetting.setting_key))
    existing = {row[0] for row in result.all()}
    created = False
    for key, meta in MANAGED_SETTINGS.items():
        if key not in existing:
            db.add(
                AdminSetting(
                    setting_key=key,
                    setting_value=meta["default"],
                    description=meta["description"],
                )
            )
            created = True
    if created:
        await db.commit()


async def get_support_contact(db: AsyncSession) -> dict[str, str]:
    """Return the current support WhatsApp (digits only) and email, falling
    back to the code defaults if a row is missing or blank."""
    result = await db.execute(
        select(AdminSetting).where(
            AdminSetting.setting_key.in_(list(MANAGED_SETTINGS.keys()))
        )
    )
    rows = {r.setting_key: (r.setting_value or "") for r in result.scalars().all()}

    whatsapp = (
        rows.get(SUPPORT_WHATSAPP_KEY)
        or MANAGED_SETTINGS[SUPPORT_WHATSAPP_KEY]["default"]
    )
    whatsapp = "".join(ch for ch in whatsapp if ch.isdigit())

    email = (
        rows.get(SUPPORT_EMAIL_KEY) or MANAGED_SETTINGS[SUPPORT_EMAIL_KEY]["default"]
    ).strip()

    return {"whatsapp": whatsapp, "email": email}
