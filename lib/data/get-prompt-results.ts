import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type PromptResults = {
  prompt: {
    id: string;
    prompt_text: string;
    target_brand: string;
    competitors: string[];
    created_at: string;
  };
  runs: {
    id: string;
    model_name: string;
    full_response: string;
    summary: string | null;
    sentiment: string | null;
    recommendation_context: string | null;
    created_at: string;
    brand_mentions: {
      brand_name: string;
      mention_count: number;
      is_target: boolean;
    }[];
    sources: { url: string; category: string }[];
  }[];
};

export async function getPromptResults(
  promptId: string,
): Promise<PromptResults | null> {
  const supabase = await createSupabaseServerClient();

  const { data: prompt, error: promptError } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", promptId)
    .maybeSingle();

  if (promptError || !prompt) {
    return null;
  }

  const p = prompt as Tables<"prompts">;

  const { data: runsRaw, error: runsError } = await supabase
    .from("ai_runs")
    .select(
      `
      id,
      model_name,
      full_response,
      summary,
      sentiment,
      recommendation_context,
      created_at,
      brand_mentions ( brand_name, mention_count, is_target ),
      sources ( url, category )
    `,
    )
    .eq("prompt_id", promptId)
    .order("created_at", { ascending: true });

  if (runsError) {
    throw new Error(runsError.message);
  }

  const runs = (runsRaw ?? []).map((row) => {
    const r = row as {
      id: string;
      model_name: string;
      full_response: string;
      summary: string | null;
      sentiment: string | null;
      recommendation_context: string | null;
      created_at: string;
      brand_mentions: {
        brand_name: string;
        mention_count: number;
        is_target: boolean;
      }[] | null;
      sources: { url: string; category: string }[] | null;
    };
    return {
      id: r.id,
      model_name: r.model_name,
      full_response: r.full_response,
      summary: r.summary,
      sentiment: r.sentiment,
      recommendation_context: r.recommendation_context,
      created_at: r.created_at,
      brand_mentions: r.brand_mentions ?? [],
      sources: r.sources ?? [],
    };
  });

  return {
    prompt: {
      id: p.id,
      prompt_text: p.prompt_text,
      target_brand: p.target_brand,
      competitors: p.competitors,
      created_at: p.created_at,
    },
    runs,
  };
}
