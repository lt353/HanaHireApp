-- Employer review of a candidate discovered in the talent pool (no job application row).
-- Mirrors applications.status / employer_notes / contact_* for pipeline UX.

CREATE TABLE IF NOT EXISTS public.employer_candidate_reviews (
  id bigserial PRIMARY KEY,
  employer_id integer NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  candidate_id integer NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  contact_method text,
  employer_notes text,
  contact_notes text,
  reviewed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (employer_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_employer_candidate_reviews_employer_id
  ON public.employer_candidate_reviews (employer_id);

CREATE INDEX IF NOT EXISTS idx_employer_candidate_reviews_candidate_id
  ON public.employer_candidate_reviews (candidate_id);

COMMENT ON TABLE public.employer_candidate_reviews IS 'Employer pipeline review for talent-pool candidates (no applications row).';
