-- Migration 042: Email (SMTP) usage events
-- Backs the admin "SMTP usage" panel. Every outbound email is recorded here
-- (success or failure) so an admin can see delivery volume and diagnose SMTP
-- problems without shell access. Writes happen from the backend service role;
-- reads are restricted to admins.

CREATE TABLE IF NOT EXISTS public.email_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email   text NOT NULL,
  subject    text,
  category   text NOT NULL DEFAULT 'general',  -- welcome | smtp_test | notification | general
  success    boolean NOT NULL DEFAULT false,
  error      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Admins can read the delivery log.
CREATE POLICY "Admins can read email events" ON public.email_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_email_events_created ON public.email_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_category_created ON public.email_events(category, created_at DESC);
