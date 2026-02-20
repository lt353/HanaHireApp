-- ==========================================
-- HanaHire Database Migration
-- Purpose: Add users table + foreign key relationships
-- ==========================================

-- 1. CREATE USERS TABLE
-- This stores ALL users (demo + real signups)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  email VARCHAR PRIMARY KEY,
  role VARCHAR NOT NULL CHECK (role IN ('seeker', 'employer')),
  name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. INSERT DEMO ACCOUNTS
-- These are permanent demo users with realistic data
-- ==========================================
INSERT INTO users (email, role, name) VALUES
  ('demo.seeker@hanahire.com', 'seeker', 'Demo Job Seeker'),
  ('demo.employer@hanahire.com', 'employer', 'Demo Employer')
ON CONFLICT (email) DO NOTHING;

-- 3. ADD FOREIGN KEY RELATIONSHIPS
-- Connect all tables together for data integrity
-- ==========================================

-- UNLOCKS TABLE
-- Links users to jobs/candidates they've unlocked
ALTER TABLE unlocks
  DROP CONSTRAINT IF EXISTS fk_unlocks_user,
  DROP CONSTRAINT IF EXISTS fk_unlocks_job,
  DROP CONSTRAINT IF EXISTS fk_unlocks_candidate;

ALTER TABLE unlocks
  ADD CONSTRAINT fk_unlocks_user
    FOREIGN KEY (user_email)
    REFERENCES users(email)
    ON DELETE CASCADE;

-- Note: We can't add FK for target_id directly since it references different tables
-- based on target_type (polymorphic relationship). This is acceptable for a prototype.

-- SAVED_ITEMS TABLE
-- Links users to jobs/candidates they've saved
ALTER TABLE saved_items
  DROP CONSTRAINT IF EXISTS fk_saved_items_user;

ALTER TABLE saved_items
  ADD CONSTRAINT fk_saved_items_user
    FOREIGN KEY (user_email)
    REFERENCES users(email)
    ON DELETE CASCADE;

-- APPLICATIONS TABLE
-- Links seekers to jobs they've applied to
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS fk_applications_seeker,
  DROP CONSTRAINT IF EXISTS fk_applications_job;

ALTER TABLE applications
  ADD CONSTRAINT fk_applications_seeker
    FOREIGN KEY (seeker_email)
    REFERENCES users(email)
    ON DELETE CASCADE,
  ADD CONSTRAINT fk_applications_job
    FOREIGN KEY (job_id)
    REFERENCES jobs(id)
    ON DELETE CASCADE;

-- JOBS TABLE
-- Link jobs to employers
ALTER TABLE jobs
  DROP CONSTRAINT IF EXISTS fk_jobs_employer;

-- Only add if employer_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'employer_id'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT fk_jobs_employer
        FOREIGN KEY (employer_id)
        REFERENCES employers(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- 4. CREATE HELPFUL VIEWS (Optional but useful)
-- ==========================================

-- View: User Application Summary
CREATE OR REPLACE VIEW user_application_summary AS
SELECT
  u.email,
  u.name,
  u.role,
  COUNT(DISTINCT a.job_id) as total_applications,
  COUNT(DISTINCT ul.target_id) FILTER (WHERE ul.target_type = 'job') as unlocked_jobs,
  COUNT(DISTINCT ul.target_id) FILTER (WHERE ul.target_type = 'candidate') as unlocked_candidates,
  COUNT(DISTINCT si.item_id) as saved_items
FROM users u
LEFT JOIN applications a ON u.email = a.seeker_email
LEFT JOIN unlocks ul ON u.email = ul.user_email
LEFT JOIN saved_items si ON u.email = si.user_email
GROUP BY u.email, u.name, u.role;

-- 5. ADD TRIGGERS FOR UPDATED_AT (Optional but recommended)
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- MIGRATION COMPLETE!
-- ==========================================

-- Verify the setup:
SELECT 'Migration completed successfully!' as status;

-- Show demo users:
SELECT * FROM users WHERE email LIKE 'demo.%';

-- Show relationship counts:
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM applications) as total_applications,
  (SELECT COUNT(*) FROM unlocks) as total_unlocks,
  (SELECT COUNT(*) FROM saved_items) as total_saved_items;
