-- Admin-controlled course catalogue fields. Price 0 means the course is free.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS price numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'Beginner',
  ADD COLUMN IF NOT EXISTS duration_weeks integer,
  ADD COLUMN IF NOT EXISTS display_tag text;

UPDATE public.courses
SET price = 0, currency = 'NGN', display_tag = 'Free'
WHERE id = 'wd101';

ALTER TABLE public.courses
  ADD CONSTRAINT courses_price_nonnegative CHECK (price >= 0),
  ADD CONSTRAINT courses_duration_positive CHECK (duration_weeks IS NULL OR duration_weeks > 0);
