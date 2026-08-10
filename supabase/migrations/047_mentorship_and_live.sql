-- Migration 047: Mentorship and Live Classes on Courses

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS live_class_url TEXT,
ADD COLUMN IF NOT EXISTS live_class_time TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.student_enrollments
ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
