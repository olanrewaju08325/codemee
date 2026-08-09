-- Only an administrator-created invitation can turn a new account into a teacher.
CREATE TABLE IF NOT EXISTS public.teacher_invitations (
  email text PRIMARY KEY,
  invited_by uuid REFERENCES public.profiles(id),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_student_id text;
  invited_teacher boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_invitations
    WHERE lower(email) = lower(new.email) AND accepted_at IS NULL
  ) INTO invited_teacher;

  IF invited_teacher THEN
    INSERT INTO public.profiles (id, student_id, full_name, role, email)
    VALUES (new.id, NULL, coalesce(new.raw_user_meta_data->>'full_name', ''), 'teacher', new.email)
    ON CONFLICT (id) DO UPDATE SET role = 'teacher', email = excluded.email;

    UPDATE public.teacher_invitations
    SET accepted_at = now()
    WHERE lower(email) = lower(new.email);
  ELSE
    new_student_id := 'CDM25' || lpad(nextval('public.student_id_seq')::text, 4, '0');
    INSERT INTO public.profiles (id, student_id, full_name, role, email)
    VALUES (new.id, new_student_id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'student', new.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

ALTER TABLE public.teacher_invitations ENABLE ROW LEVEL SECURITY;
