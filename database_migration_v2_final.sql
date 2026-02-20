-- ==========================================
-- HanaHire Database Migration V2 (FINAL FIX)
-- Purpose: Add foreign key relationships to existing tables
-- Fixes sequence issues before inserting demo accounts
-- ==========================================

-- ==========================================
-- 1. FIX SEQUENCES (prevents ID conflicts)
-- ==========================================

-- Reset candidates sequence to current max + 1
SELECT setval('candidates_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM candidates), false);

-- Reset employers sequence to current max + 1
SELECT setval('employers_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM employers), false);

-- ==========================================
-- 2. ADD UNIQUE CONSTRAINTS ON EMAIL COLUMNS
-- ==========================================

ALTER TABLE candidates
  DROP CONSTRAINT IF EXISTS candidates_email_unique;

ALTER TABLE candidates
  ADD CONSTRAINT candidates_email_unique UNIQUE (email);

ALTER TABLE employers
  DROP CONSTRAINT IF EXISTS employers_email_unique;

ALTER TABLE employers
  ADD CONSTRAINT employers_email_unique UNIQUE (email);

-- ==========================================
-- 3. ADD FOREIGN KEY RELATIONSHIPS
-- ==========================================

-- APPLICATIONS → CANDIDATES
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS fk_applications_candidate;

ALTER TABLE applications
  ADD CONSTRAINT fk_applications_candidate
    FOREIGN KEY (candidate_id)
    REFERENCES candidates(id)
    ON DELETE CASCADE;

-- APPLICATIONS → JOBS
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS fk_applications_job;

ALTER TABLE applications
  ADD CONSTRAINT fk_applications_job
    FOREIGN KEY (job_id)
    REFERENCES jobs(id)
    ON DELETE CASCADE;

-- JOBS → EMPLOYERS
ALTER TABLE jobs
  DROP CONSTRAINT IF EXISTS fk_jobs_employer;

ALTER TABLE jobs
  ADD CONSTRAINT fk_jobs_employer
    FOREIGN KEY (employer_id)
    REFERENCES employers(id)
    ON DELETE SET NULL;

-- ==========================================
-- 4. ADD INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_employers_email ON employers(email);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_unlocks_user_email ON unlocks(user_email);
CREATE INDEX IF NOT EXISTS idx_unlocks_target ON unlocks(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_email, user_role);
CREATE INDEX IF NOT EXISTS idx_saved_items_item ON saved_items(item_type, item_id);

-- ==========================================
-- 5. INSERT DEMO ACCOUNTS
-- ==========================================

-- Delete old demo accounts first
DELETE FROM candidates WHERE email = 'demo.seeker@hanahire.com';
DELETE FROM employers WHERE email = 'demo.employer@hanahire.com';

-- Insert Demo Candidate (will get next available ID from fixed sequence)
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

-- Insert Demo Employer (will get next available ID from fixed sequence)
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
-- 6. CREATE HELPFUL VIEWS
-- ==========================================

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
-- 7. VERIFICATION
-- ==========================================

SELECT
  'Migration completed successfully!' as status,
  (SELECT COUNT(*) FROM candidates) as total_candidates,
  (SELECT COUNT(*) FROM employers) as total_employers,
  (SELECT COUNT(*) FROM jobs) as total_jobs,
  (SELECT COUNT(*) FROM applications) as total_applications,
  (SELECT COUNT(*) FROM unlocks) as total_unlocks,
  (SELECT COUNT(*) FROM saved_items) as total_saved_items;

SELECT 'Demo Candidate' as account_type, id, email, name FROM candidates WHERE email = 'demo.seeker@hanahire.com'
UNION ALL
SELECT 'Demo Employer', id, email, business_name FROM employers WHERE email = 'demo.employer@hanahire.com';
