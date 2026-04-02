-- Add legal consent tracking columns to candidates and employers tables
-- Required for EEOC compliance and platform liability protection

-- Job seeker consent
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS profile_consent_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_consent_timestamp TIMESTAMPTZ;

-- Employer EEOC / fair hiring consent
ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS eeoc_consent_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS eeoc_consent_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS employee_count_range TEXT CHECK (
    employee_count_range IS NULL OR
    employee_count_range IN ('1-4', '5-9', '10-14', '15-19', '20-49', '50+')
  );
