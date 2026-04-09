-- Public job / employer pools: only rows with profile_complete = true appear in marketplace.
-- Safe if the column was added manually: IF NOT EXISTS skips.

ALTER TABLE public.employers
  ADD COLUMN IF NOT EXISTS profile_complete boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.employers.profile_complete IS
  'When true (non-empty company_logo_url), the business and its jobs appear in seeker job browse and business directory.';
