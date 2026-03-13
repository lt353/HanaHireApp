-- Add job_id to conversations so employers can message candidates about a specific job.
-- Run in Supabase SQL Editor.

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS job_id integer REFERENCES public.jobs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON public.conversations(job_id);

COMMENT ON COLUMN public.conversations.job_id IS 'When set, this conversation is about this job (employer messaged candidate from talent pool about it).';
