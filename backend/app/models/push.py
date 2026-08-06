from sqlalchemy import Column, String, DateTime, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class PushSubscription(Base):
    """Web Push subscription registered by a user's browser.

    Schema is created by supabase/migrations/015_pwa_push_offline.sql.
    """
    __tablename__ = "push_subscriptions"
    __table_args__ = (
        UniqueConstraint("user_id", "endpoint", name="uq_push_subscriptions_user_endpoint"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    endpoint = Column(String, nullable=False)
    p256dh = Column(String, nullable=True)
    auth = Column(String, nullable=True)
    # Per-subscription mute flags (legacy from migration 015; app-level
    # toggles live on notification_preferences and are authoritative).
    mute_assignments = Column(Boolean, default=False, nullable=False)
    mute_grades = Column(Boolean, default=False, nullable=False)
    mute_live = Column(Boolean, default=False, nullable=False)
    mute_announcements = Column(Boolean, default=False, nullable=False)
    mute_certificates = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class NotificationPreference(Base):
    """App-level notification settings per user.

    Schema is created by supabase/migrations/015_pwa_push_offline.sql.
    """
    __tablename__ = "notification_preferences"

    user_id = Column(UUID(as_uuid=True), primary_key=True)
    email_notifications = Column(Boolean, default=True, nullable=False)
    push_notifications = Column(Boolean, default=True, nullable=False)
    mute_assignments = Column(Boolean, default=False, nullable=False)
    mute_grades = Column(Boolean, default=False, nullable=False)
    mute_live = Column(Boolean, default=False, nullable=False)
    mute_announcements = Column(Boolean, default=False, nullable=False)
    mute_certificates = Column(Boolean, default=False, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
