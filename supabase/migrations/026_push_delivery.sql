-- Migration 026: Web Push delivery support (Part 3)
-- push_subscriptions and notification_preferences tables already exist from
-- migration 015. This adds the lookup index used by the push delivery job and
-- documents the category -> mute column mapping used at send time.

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
    ON public.push_subscriptions(user_id);

COMMENT ON TABLE public.notification_preferences IS
    'App-level notification settings per user. Mute columns are keyed by push category:
     assignment -> mute_assignments, grade/exam -> mute_grades, live_class -> mute_live,
     announcement -> mute_announcements, certificate -> mute_certificates.';
