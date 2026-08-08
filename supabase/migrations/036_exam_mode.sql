-- Distinguishes ordinary module quizzes from controlled course and final exams.
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS assessment_type TEXT NOT NULL DEFAULT 'module_quiz'
    CHECK (assessment_type IN ('module_quiz', 'course_assessment', 'final_exam')),
  ADD COLUMN IF NOT EXISTS opens_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 1 AND 360),
  ADD COLUMN IF NOT EXISTS results_released BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());
CREATE INDEX IF NOT EXISTS quizzes_exam_window_idx ON public.quizzes(opens_at, closes_at) WHERE assessment_type = 'final_exam';
