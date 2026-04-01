-- Default incomplete until the app sets is_profile_complete (see candidateTalentPool.ts):
-- true only with a stored intro video plus the same required fields as seeker onboarding.
-- Signups that stop after "Create account" stay false and can still log in to finish their profile.

ALTER TABLE public.candidates
  ALTER COLUMN is_profile_complete SET DEFAULT false;

-- Remaining NULL → incomplete until a later migration or the app sets true when pool-eligible.
UPDATE public.candidates
SET is_profile_complete = false
WHERE is_profile_complete IS NULL;
