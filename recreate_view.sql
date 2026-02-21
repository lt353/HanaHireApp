-- ============================================================
-- RECREATE job_application_summary VIEW WITH NORMALIZED DATA
-- ============================================================

-- Step B: Drop the old view
DROP VIEW IF EXISTS job_application_summary CASCADE;

-- Step C: Drop the redundant columns from jobs table
ALTER TABLE jobs
  DROP COLUMN IF EXISTS company_name,
  DROP COLUMN IF EXISTS company_industry,
  DROP COLUMN IF EXISTS company_size,
  DROP COLUMN IF EXISTS company_logo_url,
  DROP COLUMN IF EXISTS company_description,
  DROP COLUMN IF EXISTS contact_email,
  DROP COLUMN IF EXISTS contact_phone;

-- Step D: Recreate the view using JOIN with employers table
CREATE VIEW job_application_summary AS
SELECT
  j.id AS job_id,
  j.title,
  e.business_name AS company_name,  -- Now from employers table!
  j.location,
  COUNT(a.id) AS total_applications,
  COUNT(a.id) FILTER (WHERE a.status::text = 'pending'::text) AS pending_count,
  COUNT(a.id) FILTER (WHERE a.status::text = 'submitted'::text) AS submitted_count
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
JOIN employers e ON j.employer_id = e.id  -- JOIN with employers!
GROUP BY j.id, j.title, e.business_name, j.location;

-- Verify the view works
SELECT * FROM job_application_summary LIMIT 5;
