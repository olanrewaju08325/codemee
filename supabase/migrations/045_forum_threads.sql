-- Migration 045: Discussion Forums

-- Drop existing tables if they exist to ensure clean slate
DROP TABLE IF EXISTS public.forum_replies CASCADE;
DROP TABLE IF EXISTS public.forum_threads CASCADE;

-- Create forum_threads table
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_accepted_answer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_course_id ON public.forum_threads(course_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON public.forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON public.forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON public.forum_replies(created_at ASC);

-- Enable RLS
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Authenticated users can create threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Authors and teachers can delete threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Authors can update their own threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Anyone can view replies" ON public.forum_replies;
DROP POLICY IF EXISTS "Authenticated users can reply" ON public.forum_replies;
DROP POLICY IF EXISTS "Authors and teachers can delete replies" ON public.forum_replies;
DROP POLICY IF EXISTS "Authors can update their own replies" ON public.forum_replies;

-- Thread Policies
CREATE POLICY "Anyone can view threads" ON public.forum_threads 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON public.forum_threads 
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own threads" ON public.forum_threads 
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and teachers can delete threads" ON public.forum_threads 
    FOR DELETE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    );

-- Reply Policies
CREATE POLICY "Anyone can view replies" ON public.forum_replies 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can reply" ON public.forum_replies 
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own replies" ON public.forum_replies 
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and teachers can delete replies" ON public.forum_replies 
    FOR DELETE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    );

-- Function to get thread with reply count and last activity
CREATE OR REPLACE FUNCTION get_thread_details(thread_id UUID)
RETURNS TABLE(
    id UUID,
    course_id UUID,
    author_id UUID,
    title TEXT,
    content TEXT,
    is_pinned BOOLEAN,
    created_at TIMESTAMPTZ,
    reply_count BIGINT,
    last_reply_at TIMESTAMPTZ,
    author_name TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.course_id,
        t.author_id,
        t.title,
        t.content,
        t.is_pinned,
        t.created_at,
        COUNT(r.id) AS reply_count,
        MAX(r.created_at) AS last_reply_at,
        p.full_name AS author_name
    FROM forum_threads t
    LEFT JOIN forum_replies r ON r.thread_id = t.id
    LEFT JOIN profiles p ON p.id = t.author_id
    WHERE t.id = $1
    GROUP BY t.id, p.full_name;
END;
$$;

-- Function to check if user is the author or teacher
CREATE OR REPLACE FUNCTION can_modify_content(
    user_id UUID,
    content_author_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN user_id = content_author_id OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND role IN ('teacher', 'admin'));
END;
$$;

-- Verify the tables were created
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('forum_threads', 'forum_replies')
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
AND tablename IN ('forum_threads', 'forum_replies')
ORDER BY tablename, policyname;