-- MANUAL MIGRATION SCRIPT FOR EXISTING BASE64 RECEIPTS
-- 
-- This script should be run manually by an admin after deploying migration 022
-- It extracts Base64 image data from the receipt_url column and uploads it to Supabase Storage
-- 
-- IMPORTANT: This script requires manual execution and cannot be fully automated via SQL alone
-- because Supabase Storage operations require the Storage API, not just SQL.
--
-- STEPS TO MIGRATE:
-- 1. Run migration 022_payment_receipt_storage.sql first
-- 2. Run this SQL to identify records that need migration
-- 3. For each record returned, use the Supabase Storage API or dashboard to:
--    a. Extract the Base64 data from receipt_url (remove data:image/xxx;base64, prefix)
--    b. Decode the Base64 to binary
--    c. Upload to storage.payment_receipts bucket at path: student_id/receipt_id.jpg
--    d. Update the record: SET receipt_file_path = <path>, is_base64_migrated = true

-- First, check if the columns exist and add them if they don't
DO $$
BEGIN
    -- Check if receipt_file_path column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'exam_payment_verifications' 
                   AND column_name = 'receipt_file_path') THEN
        ALTER TABLE public.exam_payment_verifications ADD COLUMN receipt_file_path TEXT;
    END IF;
    
    -- Check if is_base64_migrated column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'exam_payment_verifications' 
                   AND column_name = 'is_base64_migrated') THEN
        ALTER TABLE public.exam_payment_verifications ADD COLUMN is_base64_migrated BOOLEAN DEFAULT false;
    END IF;
    
    -- Check if receipt_uploaded_at column exists (for tracking when migration happened)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'exam_payment_verifications' 
                   AND column_name = 'receipt_uploaded_at') THEN
        ALTER TABLE public.exam_payment_verifications ADD COLUMN receipt_uploaded_at TIMESTAMPTZ;
    END IF;
END $$;

-- QUERY TO FIND RECORDS NEEDING MIGRATION
SELECT 
    id,
    student_id,
    quiz_id,
    receipt_url,
    created_at
FROM exam_payment_verifications 
WHERE receipt_url IS NOT NULL
AND receipt_url LIKE 'data:image/%' 
AND (is_base64_migrated IS NULL OR is_base64_migrated = false)
ORDER BY created_at;

-- Alternative query - find records with Base64 data but no file path
SELECT 
    id,
    student_id,
    quiz_id,
    LEFT(receipt_url, 50) as receipt_preview,
    created_at
FROM exam_payment_verifications 
WHERE receipt_url IS NOT NULL
AND receipt_url LIKE 'data:image/%' 
AND (receipt_file_path IS NULL OR receipt_file_path = '')
ORDER BY created_at;

-- Count records by migration status
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN receipt_file_path IS NOT NULL AND receipt_file_path != '' THEN 1 END) as storage_based,
    COUNT(CASE WHEN receipt_url LIKE 'data:image/%' AND (is_base64_migrated IS NULL OR is_base64_migrated = false) THEN 1 END) as needs_migration,
    COUNT(CASE WHEN receipt_url LIKE 'data:image/%' AND is_base64_migrated = true THEN 1 END) as migrated
FROM exam_payment_verifications;

-- EXAMPLE UPDATE STATEMENT (run after each manual upload):
-- UPDATE exam_payment_verifications 
-- SET receipt_file_path = 'student_uuid/receipt_uuid.jpg',
--     is_base64_migrated = true,
--     receipt_uploaded_at = NOW()
-- WHERE id = 'receipt_uuid';

-- If you want to bulk mark records as migrated (only use if you've already uploaded them)
-- UPDATE exam_payment_verifications 
-- SET is_base64_migrated = true,
--     receipt_uploaded_at = NOW()
-- WHERE receipt_url LIKE 'data:image/%' 
-- AND receipt_file_path IS NOT NULL 
-- AND receipt_file_path != '';

-- Get sample receipt data for testing (shows first 100 chars of receipt)
SELECT 
    id,
    student_id,
    CASE 
        WHEN receipt_url LIKE 'data:image/%' THEN 'Base64 Receipt'
        WHEN receipt_url LIKE 'http%' THEN 'URL Receipt'
        ELSE 'Other'
    END as receipt_type,
    LEFT(receipt_url, 100) as receipt_sample,
    receipt_file_path,
    is_base64_migrated,
    created_at
FROM exam_payment_verifications 
WHERE receipt_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Note: After running this script, manually upload the Base64 data to Storage
-- using the Supabase Dashboard or API, then update the records.