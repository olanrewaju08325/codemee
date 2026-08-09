"""Self-contained password reset that does NOT depend on Supabase's built-in
recovery email (which 500s when the project SMTP/redirect allowlist isn't set).

Flow:
  1. forgot-password issues a short-lived, HMAC-signed token bound to the email.
  2. We email a reset link through OUR OWN SMTP (email_service).
  3. reset-password verifies the token and sets the new password via the
     Supabase admin API (service-role key) — reusing admin_reset_password.

The token is stateless (no DB table / migration needed): it carries the email
and an expiry, signed with SUPABASE_JWT_SECRET so it can't be forged. The short
30-minute lifetime is what bounds replay, since we have nowhere to store a
"used" flag without a migration.
"""

import base64
import hashlib
import hmac
import json
import logging
import time

from app.core.config import settings
from app.services.email_service import send_email_tracked

logger = logging.getLogger(__name__)

# How long a reset link stays valid. Kept short because the token is stateless
# and therefore can't be individually revoked once issued.
TOKEN_TTL_SECONDS = 30 * 60
_PURPOSE = "pwreset"


def _frontend_base() -> str:
    """Where reset links point. Falls back to the live Vercel URL if the
    backend's FRONTEND_URL isn't set, so links are never broken in the demo."""
    base = (settings.FRONTEND_URL or "").strip().rstrip("/")
    return base or "https://codeme-academy.vercel.app"


def _b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _b64url_decode(text: str) -> bytes:
    pad = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + pad)


def _sign(payload_b64: str) -> str:
    secret = settings.SUPABASE_JWT_SECRET.encode("utf-8")
    digest = hmac.new(secret, payload_b64.encode("ascii"), hashlib.sha256).digest()
    return _b64url(digest)


def make_reset_token(email: str) -> str:
    payload = {
        "email": email.strip().lower(),
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
        "purpose": _PURPOSE,
    }
    payload_b64 = _b64url(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    return f"{payload_b64}.{_sign(payload_b64)}"


def verify_reset_token(token: str) -> str | None:
    """Return the email if the token is valid and unexpired, else None."""
    try:
        payload_b64, signature = token.split(".", 1)
    except (ValueError, AttributeError):
        return None

    # Constant-time signature check to avoid leaking timing information.
    if not hmac.compare_digest(signature, _sign(payload_b64)):
        return None

    try:
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except (ValueError, json.JSONDecodeError):
        return None

    if payload.get("purpose") != _PURPOSE:
        return None
    if int(payload.get("exp", 0)) < int(time.time()):
        return None

    email = payload.get("email")
    return email if isinstance(email, str) and email else None


def _reset_email_html(link: str) -> str:
    return f"""\
<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a2e">
  <h2 style="margin:0 0 8px">Reset your CodeMe password</h2>
  <p style="color:#555;line-height:1.5">
    We received a request to reset the password for your CodeMe Academy account.
    Click the button below to choose a new password. This link expires in 30 minutes.
  </p>
  <p style="text-align:center;margin:28px 0">
    <a href="{link}" style="background:#0C4A8C;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;display:inline-block">
      Reset Password
    </a>
  </p>
  <p style="color:#888;font-size:13px;line-height:1.5">
    If the button doesn't work, paste this link into your browser:<br>
    <a href="{link}" style="color:#0C4A8C;word-break:break-all">{link}</a>
  </p>
  <p style="color:#aaa;font-size:12px;margin-top:24px">
    If you didn't request this, you can safely ignore this email — your password won't change.
  </p>
</div>"""


async def send_password_reset_email(db, email: str) -> bool:
    """Generate a reset link and email it through our SMTP. Returns True only
    if the email was actually delivered (so callers can offer a fallback)."""
    token = make_reset_token(email)
    link = f"{_frontend_base()}/#/reset-password?token={token}"
    return await send_email_tracked(
        db,
        to_email=email,
        subject="Reset your CodeMe Academy password",
        body=_reset_email_html(link),
        is_html=True,
        category="password_reset",
    )
