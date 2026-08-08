-- Canonical course-fee ledger. Quiz retake payments remain in their legacy table.

-- Add columns to courses table with existence checks
DO $$
BEGIN
    -- Check and add delivery_mode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'delivery_mode') THEN
        ALTER TABLE public.courses ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'hybrid';
        ALTER TABLE public.courses ADD CONSTRAINT courses_delivery_mode_check 
            CHECK (delivery_mode IN ('live', 'self_paced', 'hybrid'));
    END IF;
    
    -- Check and add payment_required
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'payment_required') THEN
        ALTER TABLE public.courses ADD COLUMN payment_required BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    
    -- Check and add installments_enabled
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'installments_enabled') THEN
        ALTER TABLE public.courses ADD COLUMN installments_enabled BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    -- Check and add access_duration_days
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'access_duration_days') THEN
        ALTER TABLE public.courses ADD COLUMN access_duration_days INTEGER;
    END IF;
END $$;

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Create invoices table - using TEXT for course_id to match courses table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  course_id TEXT NOT NULL REFERENCES public.courses(id),
  batch_id UUID REFERENCES public.batches(id),
  amount_due NUMERIC(12,2) NOT NULL CHECK (amount_due >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'issued'
    CHECK (status IN ('draft', 'issued', 'awaiting_payment', 'under_verification', 'paid', 'expired', 'cancelled')),
  due_at TIMESTAMPTZ,
  issued_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Create payment_submissions table
CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id),
  payer_name TEXT NOT NULL,
  amount_claimed NUMERIC(12,2) NOT NULL CHECK (amount_claimed >= 0),
  transfer_reference TEXT NOT NULL,
  receipt_storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'superseded')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_payment_submission_invoice_reference UNIQUE (invoice_id, transfer_reference)
);

-- Create payment_verifications table
CREATE TABLE IF NOT EXISTS public.payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.payment_submissions(id) ON DELETE CASCADE,
  verifier_id UUID NOT NULL REFERENCES public.profiles(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  reason TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS invoices_student_status_idx ON public.invoices(student_id, status);
CREATE INDEX IF NOT EXISTS invoices_course_id_idx ON public.invoices(course_id);
CREATE INDEX IF NOT EXISTS payment_submissions_status_idx ON public.payment_submissions(status, submitted_at);
CREATE UNIQUE INDEX IF NOT EXISTS payment_submissions_transfer_reference_active_idx
  ON public.payment_submissions(transfer_reference)
  WHERE status IN ('submitted', 'under_review', 'approved');

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students read active payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Students read own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Students read own payment submissions" ON public.payment_submissions;
DROP POLICY IF EXISTS "Admins manage payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins manage payment submissions" ON public.payment_submissions;
DROP POLICY IF EXISTS "Admins manage payment verifications" ON public.payment_verifications;

-- Create policies
CREATE POLICY "Students read active payment methods" ON public.payment_methods
  FOR SELECT USING (is_active = TRUE);
  
CREATE POLICY "Students read own invoices" ON public.invoices
  FOR SELECT USING (student_id = auth.uid());
  
CREATE POLICY "Students read own payment submissions" ON public.payment_submissions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.student_id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins manage payment methods" ON public.payment_methods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  
CREATE POLICY "Admins manage invoices" ON public.invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  
CREATE POLICY "Admins manage payment submissions" ON public.payment_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  
CREATE POLICY "Admins manage payment verifications" ON public.payment_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert default payment methods
INSERT INTO public.payment_methods (code, name, provider, instructions, display_order)
VALUES
  ('bank_transfer', 'Bank Transfer', 'Nigerian bank transfer', 'Use your invoice reference as the transfer narration.', 1),
  ('moniepoint', 'Moniepoint', 'Moniepoint', 'Use your invoice reference as the transfer narration.', 2),
  ('palmpay', 'PalmPay', 'PalmPay', 'Use your invoice reference as the transfer narration.', 3)
ON CONFLICT (code) DO NOTHING;

-- Receipts are never public. Students may upload only into their own prefix;
-- staff view them through time-limited signed URLs generated by the backend.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-receipts', 'payment-receipts', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Students upload own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Students read own payment receipts" ON storage.objects;
CREATE POLICY "Students upload own payment receipts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Students read own payment receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Verify the tables were created
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('payment_methods', 'invoices', 'payment_submissions', 'payment_verifications')
GROUP BY table_name
ORDER BY table_name;

-- Show payment methods
SELECT * FROM public.payment_methods ORDER BY display_order;
