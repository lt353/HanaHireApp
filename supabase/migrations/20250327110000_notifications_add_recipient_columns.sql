-- Ensure notifications has recipient_id and recipient_type (add if missing).
-- Some environments may have created the table without these columns.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'recipient_id'
    ) THEN
      ALTER TABLE public.notifications
        ADD COLUMN recipient_id integer;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'recipient_type'
    ) THEN
      ALTER TABLE public.notifications
        ADD COLUMN recipient_type text;
    END IF;
  END IF;
END $$;
