-- Allow Perplexity Sonar as a third primary provider.

ALTER TABLE public.ai_runs DROP CONSTRAINT IF EXISTS ai_runs_provider_check;

ALTER TABLE public.ai_runs
  ADD CONSTRAINT ai_runs_provider_check
  CHECK (
    provider IS NULL
    OR provider IN ('openai', 'gemini', 'perplexity')
  );
