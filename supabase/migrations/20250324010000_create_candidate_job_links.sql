-- Employer can organize unlocked candidates to one or more jobs.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.candidate_job_links (
  id bigserial PRIMARY KEY,
  employer_id integer NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  candidate_id integer NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id integer NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (employer_id, candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_job_links_employer_candidate
  ON public.candidate_job_links (employer_id, candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_job_links_job
  ON public.candidate_job_links (job_id);

COMMENT ON TABLE public.candidate_job_links IS 'Employer-managed mapping of unlocked candidates to one or more jobs.'; 
