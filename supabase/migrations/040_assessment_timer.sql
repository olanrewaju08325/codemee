-- Server-side assessment start time used to enforce duration_minutes.
CREATE TABLE IF NOT EXISTS public.quiz_attempt_starts (
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (quiz_id, student_id)
);

ALTER TABLE public.quiz_attempt_starts ENABLE ROW LEVEL SECURITY;
