-- ==========================================
-- Fix Employer Contact Name & Jobs Sequence
-- ==========================================

-- 1. ADD CONTACT_NAME COLUMN TO EMPLOYERS TABLE
-- ==========================================
ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- 2. FIX JOBS SEQUENCE (prevents duplicate key errors)
-- ==========================================
-- Reset jobs sequence to current max + 1
SELECT setval('jobs_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM jobs), false);

-- 3. VERIFY THE FIX
-- ==========================================
SELECT 'Employers table structure:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employers'
ORDER BY ordinal_position;

SELECT 'Jobs sequence current value:' as info;
SELECT last_value FROM jobs_id_seq;

SELECT 'Max job ID in table:' as info;
SELECT COALESCE(MAX(id), 0) as max_id FROM jobs;
