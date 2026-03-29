-- Only candidates who finished seeker onboarding should appear in the employer talent pool.
-- Signups that stop after "Create account" stay is_profile_complete = false until they submit full onboarding.

ALTER TABLE public.candidates
  ALTER COLUMN is_profile_complete SET DEFAULT false;

-- Legacy rows: treat video + bio as a completed profile if the flag was never set.
UPDATE public.candidates
SET is_profile_complete = true
WHERE is_profile_complete IS NULL
  AND NULLIF(TRIM(COALESCE(video_url, '')), '') IS NOT NULL
  AND NULLIF(TRIM(COALESCE(bio, '')), '') IS NOT NULL;

-- Remaining NULL → explicitly incomplete (hidden from pool).
UPDATE public.candidates
SET is_profile_complete = false
WHERE is_profile_complete IS NULL;
