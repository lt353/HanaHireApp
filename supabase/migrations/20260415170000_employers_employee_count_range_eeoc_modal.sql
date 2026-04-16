-- EmployerConsentModal saves '1-14' | '15+'; original CHECK only allowed granular buckets.
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'employers'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%employee_count_range%'
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.employers DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE public.employers
  ADD CONSTRAINT employers_employee_count_range_check CHECK (
    employee_count_range IS NULL OR
    employee_count_range IN (
      '1-4',
      '5-9',
      '10-14',
      '15-19',
      '20-49',
      '50+',
      '1-14',
      '15+'
    )
  );
