-- Ensure timestamp columns use server time (UTC on Supabase) for accuracy.
-- Client-sent timestamps can be wrong if the user's device clock is off.

-- messages.sent_at: server sets time when row is inserted (don't rely on client)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'sent_at') THEN
    ALTER TABLE public.messages ALTER COLUMN sent_at SET DEFAULT now();
  END IF;
END $$;

-- messages.read_at: keep nullable; app sets on update (optional: could use trigger to set now() on is_read=true)
-- No change for read_at.

-- applications.applied_at: server sets time on insert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'applied_at') THEN
    ALTER TABLE public.applications ALTER COLUMN applied_at SET DEFAULT now();
  END IF;
END $$;

-- applications.updated_at: ensure default for new rows
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'updated_at') THEN
    ALTER TABLE public.applications ALTER COLUMN updated_at SET DEFAULT now();
  END IF;
END $$;
