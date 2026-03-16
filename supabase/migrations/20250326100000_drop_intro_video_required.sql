-- Allow profiles without a video (and support future alternatives to video).
-- Run in Supabase Dashboard → SQL Editor.

ALTER TABLE public.candidates
  DROP CONSTRAINT IF EXISTS intro_video_required;
