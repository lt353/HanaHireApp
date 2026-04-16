-- Per-job pipeline for the same candidate (reviews + shortlists).

-- employer_candidate_reviews: add job scope
ALTER TABLE public.employer_candidate_reviews
  ADD COLUMN IF NOT EXISTS job_id integer REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE public.employer_candidate_reviews
  DROP CONSTRAINT IF EXISTS employer_candidate_reviews_employer_id_candidate_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_employer_candidate_reviews_e_c_job
  ON public.employer_candidate_reviews (employer_id, candidate_id, job_id)
  WHERE job_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_employer_candidate_reviews_e_c_legacy
  ON public.employer_candidate_reviews (employer_id, candidate_id)
  WHERE job_id IS NULL;

COMMENT ON COLUMN public.employer_candidate_reviews.job_id IS 'When set, review applies only to this job; NULL = legacy single review per employer+candidate.';

-- employer_shortlists: optional per-job shortlist
ALTER TABLE public.employer_shortlists
  ADD COLUMN IF NOT EXISTS job_id integer REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE public.employer_shortlists
  DROP CONSTRAINT IF EXISTS employer_shortlists_employer_id_candidate_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_employer_shortlists_e_c_job
  ON public.employer_shortlists (employer_id, candidate_id, job_id)
  WHERE job_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_employer_shortlists_e_c_legacy
  ON public.employer_shortlists (employer_id, candidate_id)
  WHERE job_id IS NULL;

COMMENT ON COLUMN public.employer_shortlists.job_id IS 'When set, shortlist is for this job only; NULL = global shortlist for that candidate.';
