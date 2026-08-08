-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    passing_score INTEGER DEFAULT 70 NOT NULL,
    max_attempts INTEGER, -- NULL means unlimited
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- multiple_choice, true_false, fill_blank
    options JSONB,
    correct_answer TEXT NOT NULL,
    blank_answer TEXT,
    order_index INTEGER DEFAULT 0 NOT NULL
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    attempt_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(quiz_id, student_id, attempt_number)
);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON public.quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_student ON public.quiz_attempts(quiz_id, student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_passed ON public.quiz_attempts(student_id, passed);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_order ON public.quiz_questions(quiz_id, order_index);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON public.quizzes;
DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON public.quiz_questions;
DROP POLICY IF EXISTS "Students can view their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can insert their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can update their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can delete their own quiz attempts" ON public.quiz_attempts;

-- Policies
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Quiz questions are viewable by everyone" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Students can view their own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own quiz attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Students can delete their own quiz attempts" ON public.quiz_attempts FOR DELETE USING (auth.uid() = student_id);

-- Function to get the latest quiz attempt for a student
CREATE OR REPLACE FUNCTION get_latest_quiz_attempt(
    p_quiz_id UUID,
    p_student_id UUID
)
RETURNS TABLE(
    attempt_id UUID,
    score INTEGER,
    passed BOOLEAN,
    attempt_number INTEGER,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qa.id as attempt_id,
        qa.score,
        qa.passed,
        qa.attempt_number,
        qa.created_at
    FROM quiz_attempts qa
    WHERE qa.quiz_id = p_quiz_id
    AND qa.student_id = p_student_id
    ORDER BY qa.attempt_number DESC
    LIMIT 1;
END;
$$;

-- Function to check if a student has passed a quiz
CREATE OR REPLACE FUNCTION has_passed_quiz(
    p_quiz_id UUID,
    p_student_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_passed BOOLEAN;
BEGIN
    SELECT passed INTO v_passed
    FROM quiz_attempts
    WHERE quiz_id = p_quiz_id
    AND student_id = p_student_id
    ORDER BY attempt_number DESC
    LIMIT 1;
    
    RETURN COALESCE(v_passed, FALSE);
END;
$$;

-- Function to get the number of attempts for a quiz by a student
CREATE OR REPLACE FUNCTION get_attempt_count(
    p_quiz_id UUID,
    p_student_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM quiz_attempts
    WHERE quiz_id = p_quiz_id
    AND student_id = p_student_id;
    
    RETURN v_count;
END;
$$;

-- Function to get quiz statistics
CREATE OR REPLACE FUNCTION get_quiz_statistics(
    p_quiz_id UUID
)
RETURNS TABLE(
    total_attempts INTEGER,
    average_score NUMERIC,
    pass_rate NUMERIC,
    highest_score INTEGER,
    lowest_score INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_attempts,
        ROUND(AVG(score)::NUMERIC, 2) as average_score,
        ROUND((COUNT(CASE WHEN passed = true THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) as pass_rate,
        MAX(score)::INTEGER as highest_score,
        MIN(score)::INTEGER as lowest_score
    FROM quiz_attempts
    WHERE quiz_id = p_quiz_id;
END;
$$;

-- Verify the tables were created
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('quizzes', 'quiz_questions', 'quiz_attempts')
ORDER BY table_name, ordinal_position;

-- Show all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('quizzes', 'quiz_questions', 'quiz_attempts')
ORDER BY tablename, policyname;