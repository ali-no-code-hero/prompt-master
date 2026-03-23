-- Provider + transparency for audit trail; unique provider per prompt enables partial runs + retry.

ALTER TABLE public.ai_runs
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS api_model text,
  ADD COLUMN IF NOT EXISTS used_web_search boolean,
  ADD COLUMN IF NOT EXISTS metadata jsonb;

ALTER TABLE public.ai_runs
  ADD CONSTRAINT ai_runs_provider_check
  CHECK (provider IS NULL OR provider IN ('openai', 'gemini'));

UPDATE public.ai_runs
SET
  provider = CASE
    WHEN model_name ILIKE '%gemini%' THEN 'gemini'
    WHEN model_name ILIKE '%openai%' OR model_name ~* 'gpt-' THEN 'openai'
    ELSE NULL
  END,
  used_web_search = COALESCE(used_web_search, true)
WHERE provider IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ai_runs_prompt_provider_uidx
  ON public.ai_runs (prompt_id, provider)
  WHERE provider IS NOT NULL;
