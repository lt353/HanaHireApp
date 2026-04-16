-- Employer can view any candidate profile (talent pool or applicant).
-- Tracks per-employer per-candidate view counts and last viewed time.
--
-- If this migration was not applied to your hosted project, run the same SQL in:
-- Supabase Dashboard → SQL Editor → Run (or: supabase db push / supabase migration up).

CREATE TABLE IF NOT EXISTS public.employer_candidate_views (
  id bigserial PRIMARY KEY,
  employer_id integer NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  candidate_id integer NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  view_count integer NOT NULL DEFAULT 0,
  last_viewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (employer_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_employer_candidate_views_employer_id
  ON public.employer_candidate_views (employer_id);

CREATE INDEX IF NOT EXISTS idx_employer_candidate_views_candidate_id
  ON public.employer_candidate_views (candidate_id);

COMMENT ON TABLE public.employer_candidate_views IS 'Employer per-candidate profile view tracking.';

