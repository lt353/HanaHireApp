-- Widen only the varchar(100) candidate columns that cause "value too long" on profile save.
-- Matches your schema: only availability, work_style, preferred_pay_range, display_title are 100.

ALTER TABLE public.candidates
  ALTER COLUMN availability TYPE character varying(255),
  ALTER COLUMN work_style TYPE text,
  ALTER COLUMN preferred_pay_range TYPE character varying(255),
  ALTER COLUMN display_title TYPE character varying(255);
