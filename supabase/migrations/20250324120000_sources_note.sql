-- Optional provenance: what claim or section each URL supports
ALTER TABLE public.sources
ADD COLUMN IF NOT EXISTS note text;
