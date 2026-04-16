-- Business directory profile opens; summed with job listing_view_count in employer Activity.
ALTER TABLE public.employers
  ADD COLUMN IF NOT EXISTS business_profile_view_count integer NOT NULL DEFAULT 0;
