-- Add missing columns to courses table to match SQLAlchemy model

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS total_batches INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS single_batch_only BOOLEAN NOT NULL DEFAULT FALSE;
