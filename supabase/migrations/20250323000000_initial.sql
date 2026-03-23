-- Prompt Master initial schema (historical AEO/GEO tracking)

CREATE TABLE public.prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  target_brand text NOT NULL,
  competitors text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX prompts_created_at_idx ON public.prompts (created_at DESC);

CREATE TABLE public.ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts (id) ON DELETE CASCADE,
  model_name text NOT NULL,
  full_response text NOT NULL,
  summary text,
  sentiment text,
  recommendation_context text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_runs_prompt_id_idx ON public.ai_runs (prompt_id);
CREATE INDEX ai_runs_created_at_idx ON public.ai_runs (created_at DESC);

CREATE TABLE public.brand_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.ai_runs (id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  mention_count integer NOT NULL CHECK (mention_count >= 0),
  is_target boolean NOT NULL DEFAULT false
);

CREATE INDEX brand_mentions_run_id_idx ON public.brand_mentions (run_id);

CREATE TABLE public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.ai_runs (id) ON DELETE CASCADE,
  url text NOT NULL,
  category text NOT NULL
);

CREATE INDEX sources_run_id_idx ON public.sources (run_id);

-- RLS intentionally omitted until auth; enable and add policies before production.
