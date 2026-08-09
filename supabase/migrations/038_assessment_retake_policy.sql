-- CodeMe operates with exactly three application roles: Admin, Teacher, Student.
-- Admin owns finance, admissions, support, academy settings and staff management.
UPDATE public.profiles SET role = 'admin' WHERE role IN ('finance', 'support');
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin'));
