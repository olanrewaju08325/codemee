-- 033_admin_settings.sql

-- Admin Settings Table for storing configurable business details
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.admin_settings;

-- Anyone can read public settings (like contact info, whatsapp links, payment instructions)
CREATE POLICY "Anyone can view settings"
    ON public.admin_settings FOR SELECT
    USING (true);

-- Only admins can modify settings (using profiles table which is the standard in Supabase)
CREATE POLICY "Admins can insert settings"
    ON public.admin_settings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update settings"
    ON public.admin_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete settings"
    ON public.admin_settings FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Insert default settings if they don't exist
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES
    ('PAYMENT_ACCOUNT_NAME', 'CodeMe Academy', 'Name on the bank account'),
    ('PAYMENT_BANK_NAME', 'Zenith Bank', 'Name of the bank'),
    ('PAYMENT_ACCOUNT_NUMBER', '0000000000', 'Bank account number'),
    ('PAYMENT_INSTRUCTIONS', 'Please make a transfer to the account above and upload your receipt.', 'Instructions shown to students'),
    ('ADMIN_EMAIL', 'admin@codeme.com', 'Contact email for support'),
    ('WHATSAPP_CONTACT', '+2340000000000', 'Official WhatsApp support number'),
    ('WHATSAPP_GROUP_LINK', 'https://chat.whatsapp.com/sample', 'General community WhatsApp group'),
    ('ACADEMY_ADDRESS', 'Lagos, Nigeria', 'Physical or registered address')
ON CONFLICT (setting_key) DO NOTHING;

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'admin_settings'
ORDER BY ordinal_position;

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
AND tablename = 'admin_settings'
ORDER BY policyname;

-- Show the inserted settings
SELECT * FROM public.admin_settings ORDER BY setting_key;