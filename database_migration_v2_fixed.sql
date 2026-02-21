-- ==========================================
-- HanaHire Database Migration V2 (FIXED)
-- Purpose: Add foreign key relationships to existing tables
-- Based on ACTUAL database schema with 71 employers, 71 jobs, 70 candidates
-- ==========================================

-- IMPORTANT: This migration works with your existing data structure:
-- - Seekers = candidates table (email, name, profile...)
-- - Employers = employers table (email, business_name...)
-- - NO separate users table needed!

-- ==========================================
-- 1. ADD UNIQUE CONSTRAINTS ON EMAIL COLUMNS
-- (Required for foreign keys from unlocks/saved_items)
-- ==========================================

-- Make candidates.email unique (for linking unlocks/saved_items)
ALTER TABLE candidates
  DROP CONSTRAINT IF EXISTS candidates_email_unique;

ALTER TABLE candidates
  ADD CONSTRAINT candidates_email_unique UNIQUE (email);

-- Make employers.email unique (for linking unlocks/saved_items)
ALTER TABLE employers
  DROP CONSTRAINT IF EXISTS employers_email_unique;

ALTER TABLE employers
  ADD CONSTRAINT employers_email_unique UNIQUE (email);

-- ==========================================
-- 2. ADD FOREIGN KEY RELATIONSHIPS
-- ==========================================

-- APPLICATIONS → CANDIDATES (candidate_id → candidates.id)
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS fk_applications_candidate;

ALTER TABLE applications
  ADD CONSTRAINT fk_applications_candidate
    FOREIGN KEY (candidate_id)
    REFERENCES candidates(id)
    ON DELETE CASCADE;

-- APPLICATIONS → JOBS (job_id → jobs.id)
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS fk_applications_job;

ALTER TABLE applications
  ADD CONSTRAINT fk_applications_job
    FOREIGN KEY (job_id)
    REFERENCES jobs(id)
    ON DELETE CASCADE;

-- JOBS → EMPLOYERS (employer_id → employers.id)
ALTER TABLE jobs
  DROP CONSTRAINT IF EXISTS fk_jobs_employer;

ALTER TABLE jobs
  ADD CONSTRAINT fk_jobs_employer
    FOREIGN KEY (employer_id)
    REFERENCES employers(id)
    ON DELETE SET NULL;  -- Keep job if employer deleted, but lose attribution

-- SAVED_ITEMS → CANDIDATES/EMPLOYERS (user_email → candidates.email OR employers.email)
-- Note: Can't add single FK since it references different tables based on user_role
-- This is a polymorphic relationship - acceptable for prototype

ALTER TABLE saved_items
  DROP CONSTRAINT IF EXISTS check_saved_items_email_exists;

-- UNLOCKS → CANDIDATES/EMPLOYERS (user_email → candidates.email OR employers.email)
-- Same polymorphic relationship as saved_items
ALTER TABLE unlocks
  DROP CONSTRAINT IF EXISTS check_unlocks_email_exists;

-- ==========================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ==========================================

-- Speed up lookups by email
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_employers_email ON employers(email);

-- Speed up application queries
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Speed up unlock queries
CREATE INDEX IF NOT EXISTS idx_unlocks_user_email ON unlocks(user_email);
CREATE INDEX IF NOT EXISTS idx_unlocks_target ON unlocks(target_type, target_id);

-- Speed up saved items queries
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_email, user_role);
CREATE INDEX IF NOT EXISTS idx_saved_items_item ON saved_items(item_type, item_id);

-- ==========================================
-- 4. INSERT DEMO ACCOUNTS (FIXED)
-- (Permanent demo users for testing)
-- ==========================================

-- Demo Candidate (Job Seeker) - Delete first if exists, then insert
DELETE FROM candidates WHERE email = 'demo.seeker@hanahire.com';

INSERT INTO candidates (
  name,
  email,
  location,
  skills,
  years_experience,
  bio,
  preferred_pay_range,
  education,
  is_profile_complete
) VALUES (
  'Demo Job Seeker',
  'demo.seeker@hanahire.com',
  'San Francisco, CA',
  ARRAY['Customer Service', 'Sales', 'Communication'],
  3,
  'Demo account for testing the job seeker experience. Feel free to apply to jobs and test features!',
  '$40,000-$60,000',
  'Bachelor''s Degree',
  true
);

-- Demo Employer - Delete first if exists, then insert
DELETE FROM employers WHERE email = 'demo.employer@hanahire.com';

INSERT INTO employers (
  email,
  business_name,
  industry,
  company_size,
  company_description,
  location,
  business_verified
) VALUES (
  'demo.employer@hanahire.com',
  'Demo Company Inc',
  'Technology',
  '10-50',
  'Demo account for testing the employer experience. Post jobs and browse candidates!',
  'San Francisco, CA',
  true
);

-- ==========================================
-- 5. CREATE HELPFUL VIEWS
-- ==========================================

-- View: Application Summary by Candidate
CREATE OR REPLACE VIEW candidate_application_summary AS
SELECT
  c.id as candidate_id,
  c.name,
  c.email,
  COUNT(a.id) as total_applications,
  COUNT(a.id) FILTER (WHERE a.status = 'pending') as pending_applications,
  COUNT(a.id) FILTER (WHERE a.status = 'submitted') as submitted_applications,
  MAX(a.applied_at) as last_applied_at
FROM candidates c
LEFT JOIN applications a ON c.id = a.candidate_id
GROUP BY c.id, c.name, c.email;

-- View: Job Application Summary
CREATE OR REPLACE VIEW job_application_summary AS
SELECT
  j.id as job_id,
  j.title,
  j.company_name,
  j.location,
  COUNT(a.id) as total_applications,
  COUNT(a.id) FILTER (WHERE a.status = 'pending') as pending_count,
  COUNT(a.id) FILTER (WHERE a.status = 'submitted') as submitted_count
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, j.title, j.company_name, j.location;

-- View: Unlock Activity Summary
CREATE OR REPLACE VIEW unlock_activity_summary AS
SELECT
  user_email,
  user_role,
  COUNT(*) FILTER (WHERE target_type = 'job') as jobs_unlocked,
  COUNT(*) FILTER (WHERE target_type = 'candidate') as candidates_unlocked,
  SUM(amount_paid) as total_spent,
  MAX(unlocked_at) as last_unlock_at
FROM unlocks
GROUP BY user_email, user_role;

-- ==========================================
-- 6. VERIFICATION
-- ==========================================

-- Show relationship setup
SELECT
  'Migration completed successfully!' as status,
  (SELECT COUNT(*) FROM candidates) as total_candidates,
  (SELECT COUNT(*) FROM employers) as total_employers,
  (SELECT COUNT(*) FROM jobs) as total_jobs,
  (SELECT COUNT(*) FROM applications) as total_applications,
  (SELECT COUNT(*) FROM unlocks) as total_unlocks,
  (SELECT COUNT(*) FROM saved_items) as total_saved_items;

-- Show demo accounts
SELECT 'Demo Candidate' as account_type, id, email, name FROM candidates WHERE email = 'demo.seeker@hanahire.com'
UNION ALL
SELECT 'Demo Employer', id, email, business_name FROM employers WHERE email = 'demo.employer@hanahire.com';
