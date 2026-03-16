-- Add conversation_id to notifications if the table exists but the column is missing
-- (e.g. table was created elsewhere without this column)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'conversation_id'
    ) THEN
      ALTER TABLE public.notifications
        ADD COLUMN conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;
