-- Migration 028: AI Tutor scaffolding (Part 4)
-- Provider-agnostic AI layer. Tables back the mock provider today and
-- the real providers plugged in during Part 4b.
--   * ai_chat_messages      - persisted student <-> tutor chat history
--   * ai_reviews            - teacher-editable AI draft reviews of submissions
--   * ai_settings           - admin-adjustable AI config (daily cap)

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  role         text NOT NULL CHECK (role IN ('user', 'assistant')),
  content      text NOT NULL,
  context_code text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their chat messages" ON public.ai_chat_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_ai_chat_user_created
  ON public.ai_chat_messages(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ai_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE,
  feedback      text,
  score         integer,
  is_ai_flagged boolean DEFAULT false,
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'discarded')),
  created_by    uuid NOT NULL,
  confirmed_by  uuid,
  created_at    timestamptz DEFAULT now(),
  confirmed_at  timestamptz
);

ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage AI reviews" ON public.ai_reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE INDEX idx_ai_reviews_status ON public.ai_reviews(status);

CREATE TABLE IF NOT EXISTS public.ai_review_usage (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_review_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage AI review usage" ON public.ai_review_usage
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE INDEX idx_ai_review_usage_user_created
  ON public.ai_review_usage(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ai_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read AI settings" ON public.ai_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );
CREATE POLICY "Admins can update AI settings" ON public.ai_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.ai_settings (key, value)
VALUES ('daily_limit', '20'), ('review_daily_limit', '120')
ON CONFLICT (key) DO NOTHING;
