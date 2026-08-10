-- live_class_schedules
CREATE TABLE IF NOT EXISTS public.live_class_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    instructor_name VARCHAR NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    meeting_link VARCHAR,
    recording_url VARCHAR,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- badges
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR,
    points_required INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- achievements
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    criteria TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- add title to announcements if not exists
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title VARCHAR;

-- add missing RLS policies for the new tables
ALTER TABLE public.live_class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to read live_class_schedules" ON public.live_class_schedules FOR SELECT USING (true);
CREATE POLICY "Allow anyone to read badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Allow anyone to read achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Allow users to read their own user_achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
