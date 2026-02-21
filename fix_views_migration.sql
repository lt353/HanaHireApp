-- ============================================================
-- FIX VIEWS BEFORE DROPPING COLUMNS
--
-- The view job_application_summary depends on columns we're
-- removing. We need to recreate it to use the employers table.
-- ============================================================

-- STEP 1: Check what views exist and what they depend on
SELECT
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%job%';

-- STEP 2: Drop the old view (we'll recreate it properly)
DROP VIEW IF EXISTS job_application_summary CASCADE;

-- STEP 3: Recreate the view using JOIN with employers table
-- (Run this AFTER checking the original view definition above)
-- Example structure (adjust based on what you see in STEP 1):
/*
CREATE VIEW job_application_summary AS
SELECT
  jobs.id,
  jobs.title,
  jobs.location,
  jobs.pay_range,
  jobs.status,
  jobs.applicant_count,
  employers.business_name AS company_name,
  employers.industry AS company_industry,
  employers.email AS contact_email
FROM jobs
JOIN employers ON jobs.employer_id = employers.id;
*/

-- STEP 4: Now you can safely drop the redundant columns
ALTER TABLE jobs
  DROP COLUMN company_name,
  DROP COLUMN company_industry,
  DROP COLUMN company_size,
  DROP COLUMN company_logo_url,
  DROP COLUMN company_description,
  DROP COLUMN contact_email,
  DROP COLUMN contact_phone;

-- ============================================================
-- INSTRUCTIONS:
-- 1. Run STEP 1 to see the current view definition
-- 2. Copy that definition for reference
-- 3. Run STEP 2 to drop the old view
-- 4. Modify and run STEP 3 to recreate with JOINs
-- 5. Run STEP 4 to drop the columns
-- ============================================================
