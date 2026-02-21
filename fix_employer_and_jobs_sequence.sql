-- ==========================================
-- Fix Jobs Sequence
-- ==========================================

-- FIX JOBS SEQUENCE (prevents duplicate key errors)
SELECT setval('jobs_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM jobs), false);

-- VERIFY THE FIX
SELECT 'Jobs sequence current value:' as info;
SELECT last_value FROM jobs_id_seq;

SELECT 'Max job ID in table:' as info;
SELECT COALESCE(MAX(id), 0) as max_id FROM jobs;

-- ==========================================
-- Update your employer record with contact name
-- ==========================================
-- REPLACE 'your-email@example.com' with your actual email
-- REPLACE 'Your Name' with your actual contact name

-- UPDATE employers
-- SET contact_name = 'Your Name'
-- WHERE email = 'your-email@example.com';
