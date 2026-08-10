const { Client } = require('pg');

const connectionString = 'postgres://postgres.lnrchirwppzgjbndmegl:CwI8WOyQ5I3SQRd8@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function migrate() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    const sql = `
-- add body to announcements if not exists
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title VARCHAR;

-- create tables if they don't exist
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

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR,
    points_required INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    criteria TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- add missing RLS policies for the new tables safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'live_class_schedules' AND policyname = 'Allow anyone to read live_class_schedules'
    ) THEN
        CREATE POLICY "Allow anyone to read live_class_schedules" ON public.live_class_schedules FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Allow anyone to read badges'
    ) THEN
        CREATE POLICY "Allow anyone to read badges" ON public.badges FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Allow anyone to read achievements'
    ) THEN
        CREATE POLICY "Allow anyone to read achievements" ON public.achievements FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Allow users to read their own user_achievements'
    ) THEN
        CREATE POLICY "Allow users to read their own user_achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;
    `;

    console.log("Executing SQL migration...");
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
