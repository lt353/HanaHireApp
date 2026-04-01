-- Talent pool: is_profile_complete = true only when intro video exists and core fields are filled.
-- Rows without video stay false so employers do not see them; seekers can still log in and edit.

UPDATE public.candidates
SET
  is_profile_complete = true,
  updated_at = now()
WHERE visibility_preference = 'broad'
  AND COALESCE(is_profile_complete, false) = false
  AND NULLIF(TRIM(COALESCE(video_url, '')), '') IS NOT NULL
  AND NULLIF(TRIM(COALESCE(bio, '')), '') IS NOT NULL
  AND skills IS NOT NULL
  AND cardinality(skills) > 0
  AND NULLIF(TRIM(COALESCE(location, '')), '') IS NOT NULL
  AND industries_interested IS NOT NULL
  AND cardinality(industries_interested) > 0;

-- Drop stale "complete" flags when video was removed or never set.
UPDATE public.candidates
SET
  is_profile_complete = false,
  updated_at = now()
WHERE COALESCE(is_profile_complete, false) = true
  AND NULLIF(TRIM(COALESCE(video_url, '')), '') IS NULL;
