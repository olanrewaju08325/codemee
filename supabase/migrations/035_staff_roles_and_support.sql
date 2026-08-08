-- Least-privilege staff roles and a real support desk.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'support', 'finance', 'admin'));

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  owner_id UUID REFERENCES public.profiles(id),
  course_id TEXT REFERENCES public.courses(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('account', 'enrollment', 'payment', 'technical', 'academic', 'certificate', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'waiting_on_student', 'resolved', 'closed')),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'student' CHECK (visibility IN ('student', 'internal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS support_tickets_owner_status_idx ON public.support_tickets(owner_id, status);
CREATE INDEX IF NOT EXISTS support_tickets_student_created_idx ON public.support_tickets(student_id, created_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own support tickets" ON public.support_tickets FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students create own support tickets" ON public.support_tickets FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students read ticket messages" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.student_id = auth.uid())
);
