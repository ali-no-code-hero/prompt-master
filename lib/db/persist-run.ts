import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type RunPayload = {
  modelName: string;
  fullResponse: string;
  summary: string;
  sentiment: string;
  recommendationContext: string;
  mentions: {
    brand_name: string;
    mention_count: number;
    is_target: boolean;
  }[];
  sources: { url: string; category: string }[];
};

export async function insertPromptAndRuns(
  supabase: SupabaseClient<Database>,
  input: {
    promptText: string;
    targetBrand: string;
    competitors: string[];
    runs: RunPayload[];
  },
): Promise<{ promptId: string }> {
  const { data: promptRow, error: promptError } = await supabase
    .from("prompts")
    .insert({
      prompt_text: input.promptText,
      target_brand: input.targetBrand,
      competitors: input.competitors,
    })
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
        })),
      );
      if (sErr) {
        throw new Error(sErr.message);
      }
    }
  }

  return { promptId };
}
