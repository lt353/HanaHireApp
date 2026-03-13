-- =============================================================================
-- Backfill conversations from existing messages (e.g. demo employer + demo seeker)
-- Run this in Supabase SQL Editor. Creates conversations table if missing, then backfills.
-- =============================================================================

-- Ensure conversations table exists
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id integer NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  candidate_id integer NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(employer_id, candidate_id)
);
CREATE INDEX IF NOT EXISTS idx_conversations_employer_id ON public.conversations(employer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_candidate_id ON public.conversations(candidate_id);

-- For each distinct conversation_id in messages, create a conversations row by
-- resolving from_email/to_email to employer_id and candidate_id.
INSERT INTO public.conversations (id, employer_id, candidate_id)
SELECT
  m.conversation_id,
  e.id AS employer_id,
  c.id AS candidate_id
FROM (
  SELECT DISTINCT conversation_id, from_email, to_email
  FROM public.messages
  WHERE conversation_id IS NOT NULL
) m
CROSS JOIN LATERAL (
  SELECT id FROM public.employers
  WHERE email IN (m.from_email, m.to_email)
  LIMIT 1
) e
CROSS JOIN LATERAL (
  SELECT id FROM public.candidates
  WHERE email IN (m.from_email, m.to_email)
  LIMIT 1
) c
WHERE e.id IS NOT NULL AND c.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.conversations conv WHERE conv.id = m.conversation_id
  )
ON CONFLICT (id) DO NOTHING;
