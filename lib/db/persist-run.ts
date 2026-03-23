import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";
import type { ModelKind } from "@/lib/ai/constants";

export type RunPayload = {
  modelName: string;
  provider: ModelKind;
  apiModel: string;
  usedWebSearch: boolean;
  metadata: Record<string, unknown> | null;
  fullResponse: string;
  summary: string;
  sentiment: string;
  recommendationContext: string;
  mentions: {
    brand_name: string;
    mention_count: number;
    is_target: boolean;
  }[];
  sources: { url: string; category: string; note: string | null }[];
};

export async function insertPromptAndRuns(
  supabase: SupabaseClient<Database>,
  input: {
    promptText: string;
    targetBrand: string;
    competitors: string[];
    seriesId?: string | null;
    brandAliases?: Record<string, string[]> | null;
    userId?: string | null;
    runs: RunPayload[];
  },
): Promise<{ promptId: string }> {
  const insertRow: Database["public"]["Tables"]["prompts"]["Insert"] = {
    prompt_text: input.promptText,
    target_brand: input.targetBrand,
    competitors: input.competitors,
  };
  if (input.seriesId) {
    insertRow.series_id = input.seriesId;
  }
  if (input.brandAliases && Object.keys(input.brandAliases).length > 0) {
    insertRow.brand_aliases = input.brandAliases as Json;
  }
  if (input.userId) {
    insertRow.user_id = input.userId;
  }

  const { data: promptRow, error: promptError } = await supabase
    .from("prompts")
    .insert(insertRow)
    .select("id")
    .single();

  if (promptError || !promptRow) {
    throw new Error(promptError?.message ?? "Failed to insert prompt");
  }

  const promptId = promptRow.id;

  for (const run of input.runs) {
    const { data: runRow, error: runError } = await supabase
      .from("ai_runs")
      .insert({
        prompt_id: promptId,
        model_name: run.modelName,
        provider: run.provider,
        api_model: run.apiModel,
        used_web_search: run.usedWebSearch,
        metadata: run.metadata as Json,
        full_response: run.fullResponse,
        summary: run.summary,
        sentiment: run.sentiment,
        recommendation_context: run.recommendationContext,
      })
      .select("id")
      .single();

    if (runError || !runRow) {
      throw new Error(runError?.message ?? "Failed to insert ai_run");
    }

    const runId = runRow.id;

    if (run.mentions.length > 0) {
      const { error: mErr } = await supabase.from("brand_mentions").insert(
        run.mentions.map((m) => ({
          run_id: runId,
          brand_name: m.brand_name,
          mention_count: m.mention_count,
          is_target: m.is_target,
        })),
      );
      if (mErr) {
        throw new Error(mErr.message);
      }
    }

    if (run.sources.length > 0) {
      const { error: sErr } = await supabase.from("sources").insert(
        run.sources.map((s) => ({
          run_id: runId,
          url: s.url,
          category: s.category,
          note: s.note,
        })),
      );
      if (sErr) {
        throw new Error(sErr.message);
      }
    }
  }

  return { promptId };
}

export async function appendRunToPrompt(
  supabase: SupabaseClient<Database>,
  input: {
    promptId: string;
    run: RunPayload;
  },
): Promise<{ runId: string }> {
  const run = input.run;
  const { data: runRow, error: runError } = await supabase
    .from("ai_runs")
    .insert({
      prompt_id: input.promptId,
      model_name: run.modelName,
      provider: run.provider,
      api_model: run.apiModel,
      used_web_search: run.usedWebSearch,
      metadata: run.metadata as Json,
      full_response: run.fullResponse,
      summary: run.summary,
      sentiment: run.sentiment,
      recommendation_context: run.recommendationContext,
    })
    .select("id")
    .single();

  if (runError || !runRow) {
    throw new Error(runError?.message ?? "Failed to insert ai_run");
  }

  const runId = runRow.id;

  if (run.mentions.length > 0) {
    const { error: mErr } = await supabase.from("brand_mentions").insert(
      run.mentions.map((m) => ({
        run_id: runId,
        brand_name: m.brand_name,
        mention_count: m.mention_count,
        is_target: m.is_target,
      })),
    );
    if (mErr) {
      throw new Error(mErr.message);
    }
  }

  if (run.sources.length > 0) {
    const { error: sErr } = await supabase.from("sources").insert(
      run.sources.map((s) => ({
        run_id: runId,
        url: s.url,
        category: s.category,
        note: s.note,
      })),
    );
    if (sErr) {
      throw new Error(sErr.message);
    }
  }

  return { runId };
}
