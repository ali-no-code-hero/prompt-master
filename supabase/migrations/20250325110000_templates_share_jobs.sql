-- Saved prompts; read-only shares; async job tracking.

CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  intent text NOT NULL,
  prompt_text text NOT NULL,
  target_brand text NOT NULL,
  competitors text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prompt_templates_user_id_idx
  ON public.prompt_templates (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.share_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS share_tokens_prompt_id_idx ON public.share_tokens (prompt_id);

CREATE TABLE IF NOT EXISTS public.analysis_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error text,
  result_prompt_id uuid REFERENCES public.prompts (id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analysis_jobs_status_idx ON public.analysis_jobs (status);
