-- ==========================================
-- Sample Data Queries
-- Run each section separately in Supabase SQL Editor
-- ==========================================

-- 1. EMPLOYERS (first 5 rows)
SELECT id, email, business_name, industry, location, created_at
FROM employers
ORDER BY id
LIMIT 5;

-- 2. JOBS (first 5 rows)
SELECT id, title, company_name, location, job_type, pay_range, employer_id, is_anonymous
FROM jobs
ORDER BY id
LIMIT 5;

-- 3. CANDIDATES (first 5 rows)
SELECT id, name, email, location, skills, years_experience, preferred_pay_range
FROM candidates
ORDER BY id
LIMIT 5;

-- 4. APPLICATIONS (all rows - see what exists)
SELECT id, job_id, candidate_id, status, applied_at
FROM applications
ORDER BY id;

-- 5. UNLOCKS (all rows - see what exists)
SELECT id, user_email, user_role, target_type, target_id, unlocked_at
FROM unlocks
ORDER BY id;

-- 6. SAVED_ITEMS (all rows - see what exists)
SELECT id, user_email, user_role, item_type, item_id, saved_at
FROM saved_items
ORDER BY id;

-- 7. CHECK IF ANY DATA EXISTS
SELECT
  'employers' as table_name,
  COUNT(*) as row_count
FROM employers
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'candidates', COUNT(*) FROM candidates
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'unlocks', COUNT(*) FROM unlocks
UNION ALL
SELECT 'saved_items', COUNT(*) FROM saved_items;
