-- Aggregate "job listing was opened" impressions for employer Activity → Job views.
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS listing_view_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_job_listing_views(p_job_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
  SET listing_view_count = listing_view_count + 1
  WHERE id = p_job_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_job_listing_views(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_job_listing_views(integer) TO anon, authenticated;
