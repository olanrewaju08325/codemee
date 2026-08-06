-- Migration 027: Exam scheduling on quizzes (Part 4)
-- Adds an optional exam date/time to quizzes so teachers can schedule
-- exams and cron-driven reminders can fire ahead of the due time.
-- NULL scheduled_at keeps a quiz as a self-paced module quiz (no reminder).

ALTER TABLE public.quizzes
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_quizzes_scheduled_at
    ON public.quizzes(scheduled_at)
    WHERE scheduled_at IS NOT NULL;
