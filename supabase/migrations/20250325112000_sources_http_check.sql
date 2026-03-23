-- Optional async / manual link health (stretch: populate via checker).

ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS http_status smallint,
  ADD COLUMN IF NOT EXISTS checked_at timestamptz;
