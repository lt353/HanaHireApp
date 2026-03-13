-- =============================================================================
-- Messaging: conversations table + messages table adjustments
-- Run this in Supabase SQL Editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create conversations table (one row per employer–candidate pair)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id integer NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  candidate_id integer NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(employer_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_employer_id ON public.conversations(employer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_candidate_id ON public.conversations(candidate_id);

COMMENT ON TABLE public.conversations IS 'One row per employer-candidate pair for messaging.';

-- -----------------------------------------------------------------------------
-- 2. Adjust messages table
-- -----------------------------------------------------------------------------
-- Ensure conversation_id exists (if you created messages without it, add the column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN conversation_id uuid;
  END IF;
END $$;

-- Remove default so every new message must supply a conversation_id from conversations.
-- (Prevents random UUIDs that don't match any conversation.)
ALTER TABLE public.messages ALTER COLUMN conversation_id DROP DEFAULT;

-- subject is unused by the app; keep as nullable for future use (no change).
-- To drop it: ALTER TABLE public.messages DROP COLUMN IF EXISTS subject;

-- Optional: tie messages to conversations (run only if existing rows have valid conversation_ids,
-- or after cleaning old rows: DELETE FROM public.messages WHERE conversation_id IS NULL
-- or WHERE conversation_id NOT IN (SELECT id FROM public.conversations);)
-- ALTER TABLE public.messages
--   DROP CONSTRAINT IF EXISTS fk_messages_conversation;
-- ALTER TABLE public.messages
--   ADD CONSTRAINT fk_messages_conversation
--   FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Optional: index for listing messages by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
