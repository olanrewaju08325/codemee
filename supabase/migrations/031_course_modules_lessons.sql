-- Create modules table (matching SQLAlchemy model)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    project_scenario TEXT,
    project_instructions TEXT,
    project_solution TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create lessons table (matching SQLAlchemy model)
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    learning_objectives TEXT,
    estimated_duration INTEGER DEFAULT 30 NOT NULL,
    video_url TEXT,
    pdf_url TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    points INTEGER DEFAULT 100 NOT NULL,
    is_required BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create or alter student_progress table
DO $$
BEGIN
    -- Check if table exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'student_progress') THEN
        CREATE TABLE public.student_progress (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'completed' NOT NULL,
            completed_at TIMESTAMPTZ DEFAULT NOW(),
            last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(student_id, lesson_id)
        );
    ELSE
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'student_progress' 
                       AND column_name = 'status') THEN
            ALTER TABLE public.student_progress ADD COLUMN status TEXT DEFAULT 'completed' NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'student_progress' 
                       AND column_name = 'created_at') THEN
            ALTER TABLE public.student_progress ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_assignments_module_id ON public.assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON public.student_progress(student_id);

-- Add composite indexes for common queries
-- Check if status column exists before creating index
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'student_progress' 
               AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_student_progress_student_status ON public.student_progress(student_id, status);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON public.lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON public.modules(course_id, order_index);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Modules are viewable by everyone" ON public.modules;
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON public.assignments;
DROP POLICY IF EXISTS "Students can view their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can insert their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can delete their own progress" ON public.student_progress;

-- Policies
CREATE POLICY "Modules are viewable by everyone" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Assignments are viewable by everyone" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Students can view their own progress" ON public.student_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own progress" ON public.student_progress FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own progress" ON public.student_progress FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Students can delete their own progress" ON public.student_progress FOR DELETE USING (auth.uid() = student_id);

-- Function to get progress for a student in a course
CREATE OR REPLACE FUNCTION get_student_course_progress(
    p_student_id UUID,
    p_course_id UUID
)
RETURNS TABLE(
    total_lessons INTEGER,
    completed_lessons INTEGER,
    progress_percentage NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.id)::INTEGER as total_lessons,
        COUNT(DISTINCT sp.lesson_id)::INTEGER as completed_lessons,
        CASE 
            WHEN COUNT(DISTINCT l.id) > 0 THEN 
                ROUND((COUNT(DISTINCT sp.lesson_id)::NUMERIC / COUNT(DISTINCT l.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as progress_percentage
    FROM modules m
    JOIN lessons l ON l.module_id = m.id
    LEFT JOIN student_progress sp ON sp.lesson_id = l.id AND sp.student_id = p_student_id AND sp.status = 'completed'
    WHERE m.course_id = p_course_id
    AND m.is_published = true;
END;
$$;

-- Function to get the next lesson for a student
CREATE OR REPLACE FUNCTION get_next_lesson(
    p_student_id UUID,
    p_course_id UUID
)
RETURNS TABLE(
    lesson_id UUID,
    lesson_title TEXT,
    module_id UUID,
    module_title TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id as lesson_id,
        l.title as lesson_title,
        m.id as module_id,
        m.title as module_title
    FROM modules m
    JOIN lessons l ON l.module_id = m.id
    LEFT JOIN student_progress sp ON sp.lesson_id = l.id AND sp.student_id = p_student_id AND sp.status = 'completed'
    WHERE m.course_id = p_course_id
    AND m.is_published = true
    AND sp.id IS NULL
    ORDER BY m.order_index, l.order_index
    LIMIT 1;
END;
$$;

-- Function to check if a student has completed a lesson
CREATE OR REPLACE FUNCTION has_completed_lesson(
    p_student_id UUID,
    p_lesson_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM student_progress 
        WHERE student_id = p_student_id 
        AND lesson_id = p_lesson_id
        AND status = 'completed'
    );
END;
$$;

-- Verify the tables were created
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('modules', 'lessons', 'assignments', 'student_progress')
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
AND tablename IN ('modules', 'lessons', 'assignments', 'student_progress')
ORDER BY tablename, policyname;