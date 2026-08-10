-- Migration 044: Direct Messaging

CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'direct_messages' AND policyname = 'Users can view their own messages') THEN
        CREATE POLICY "Users can view their own messages" ON public.direct_messages FOR SELECT USING (
            auth.uid() = sender_id OR auth.uid() = receiver_id
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'direct_messages' AND policyname = 'Users can send messages') THEN
        CREATE POLICY "Users can send messages" ON public.direct_messages FOR INSERT WITH CHECK (
            auth.uid() = sender_id
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'direct_messages' AND policyname = 'Receivers can update read status') THEN
        CREATE POLICY "Receivers can update read status" ON public.direct_messages FOR UPDATE USING (
            auth.uid() = receiver_id
        );
    END IF;
END $$;
