-- Group executions for timeline/compare; optional per-prompt alias map; optional owner for RLS.

ALTER TABLE public.prompts
  ADD COLUMN IF NOT EXISTS series_id uuid,
  ADD COLUMN IF NOT EXISTS brand_aliases jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL;

UPDATE public.prompts SET series_id = gen_random_uuid() WHERE series_id IS NULL;

ALTER TABLE public.prompts ALTER COLUMN series_id SET NOT NULL;
ALTER TABLE public.prompts ALTER COLUMN series_id SET DEFAULT gen_random_uuid();
