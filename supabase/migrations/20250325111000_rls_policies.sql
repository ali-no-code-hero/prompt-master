-- RLS: signed-in users own their rows; legacy rows (user_id IS NULL) remain readable/writable by anon (dev / single-tenant).

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY prompts_select ON public.prompts
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY prompts_insert ON public.prompts
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY prompts_update ON public.prompts
  FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY prompts_delete ON public.prompts
  FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY prompt_templates_select ON public.prompt_templates
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY prompt_templates_insert ON public.prompt_templates
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY prompt_templates_update ON public.prompt_templates
  FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY prompt_templates_delete ON public.prompt_templates
  FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY share_tokens_all ON public.share_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.prompts p
      WHERE p.id = share_tokens.prompt_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts p
      WHERE p.id = share_tokens.prompt_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY analysis_jobs_all ON public.analysis_jobs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY ai_runs_select ON public.ai_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.prompts p
      WHERE p.id = ai_runs.prompt_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY ai_runs_insert ON public.ai_runs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts p
      WHERE p.id = ai_runs.prompt_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY ai_runs_update ON public.ai_runs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.prompts p
      WHERE p.id = ai_runs.prompt_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY ai_runs_delete ON public.ai_runs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.prompts p
      WHERE p.id = ai_runs.prompt_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY brand_mentions_select ON public.brand_mentions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_runs r
      JOIN public.prompts p ON p.id = r.prompt_id
      WHERE r.id = brand_mentions.run_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY brand_mentions_insert ON public.brand_mentions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_runs r
      JOIN public.prompts p ON p.id = r.prompt_id
      WHERE r.id = brand_mentions.run_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY brand_mentions_update ON public.brand_mentions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ai_runs r
      JOIN public.prompts p ON p.id = r.prompt_id
      WHERE r.id = brand_mentions.run_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY brand_mentions_delete ON public.brand_mentions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ai_runs r
      JOIN public.prompts p ON p.id = r.prompt_id
      WHERE r.id = brand_mentions.run_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY sources_select ON public.sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_runs r
      JOIN public.prompts p ON p.id = r.prompt_id
      WHERE r.id = sources.run_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY sources_insert ON public.sources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_runs r
      JOIN public.prompts p ON p.id = r.prompt_id
      WHERE r.id = sources.run_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY sources_update ON public.sources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ai_runs r
      JOIN public.prompts p ON p.id = r.prompt_id
      WHERE r.id = sources.run_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );

CREATE POLICY sources_delete ON public.sources
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ai_runs r
      JOIN public.prompts p ON p.id = r.prompt_id
      WHERE r.id = sources.run_id
        AND (p.user_id IS NULL OR auth.uid() = p.user_id)
    )
  );
