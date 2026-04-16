-- Employer can shortlist any candidate (applies to talent pool, saved, messages, applicants).

CREATE TABLE IF NOT EXISTS public.employer_shortlists (
  id bigserial PRIMARY KEY,
  employer_id integer NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  candidate_id integer NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (employer_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_employer_shortlists_employer_id
  ON public.employer_shortlists (employer_id);

CREATE INDEX IF NOT EXISTS idx_employer_shortlists_candidate_id
  ON public.employer_shortlists (candidate_id);

COMMENT ON TABLE public.employer_shortlists IS 'Employer-managed shortlist of candidates (independent of applications).';

