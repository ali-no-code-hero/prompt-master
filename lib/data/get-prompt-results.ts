import type { SupabaseClient } from "@supabase/supabase-js";

import { alignMentionsToBrands } from "@/lib/ai/sov";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/types/database";

export type PromptResults = {
  prompt: {
    id: string;
    prompt_text: string;
    target_brand: string;
    competitors: string[];
    series_id: string;
    brand_aliases: Record<string, string[]>;
    created_at: string;
  };
  runs: {
    id: string;
    model_name: string;
    provider: string | null;
    api_model: string | null;
    used_web_search: boolean | null;
    metadata: unknown;
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
    sources: {
      id: string;
      url: string;
      category: string;
      note: string | null;
      http_status: number | null;
      checked_at: string | null;
    }[];
  }[];
};

function asBrandAliases(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      out[k] = v as string[];
    }
  }
  return out;
}

export async function fetchPromptResultsWithSupabase(
  supabase: SupabaseClient<Database>,
  promptId: string,
): Promise<PromptResults | null> {
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
      provider,
      api_model,
      used_web_search,
      metadata,
      full_response,
      summary,
      sentiment,
      recommendation_context,
      created_at,
      brand_mentions ( brand_name, mention_count, is_target ),
      sources ( id, url, category, note, http_status, checked_at )
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
      provider: string | null;
      api_model: string | null;
      used_web_search: boolean | null;
      metadata: unknown;
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
      sources: {
        id: string;
        url: string;
        category: string;
        note: string | null;
        http_status: number | null;
        checked_at: string | null;
      }[] | null;
    };
    return {
      id: r.id,
      model_name: r.model_name,
      provider: r.provider,
      api_model: r.api_model,
      used_web_search: r.used_web_search,
      metadata: r.metadata,
      full_response: r.full_response,
      summary: r.summary,
      sentiment: r.sentiment,
      recommendation_context: r.recommendation_context,
      created_at: r.created_at,
      brand_mentions: alignMentionsToBrands(
        p.target_brand,
        p.competitors,
        (r.brand_mentions ?? []).map((m) => ({
          brand_name: m.brand_name,
          count: m.mention_count,
          is_target: m.is_target,
        })),
      ),
      sources: r.sources ?? [],
    };
  });

  return {
    prompt: {
      id: p.id,
      prompt_text: p.prompt_text,
      target_brand: p.target_brand,
      competitors: p.competitors,
      series_id: p.series_id,
      brand_aliases: asBrandAliases(p.brand_aliases),
      created_at: p.created_at,
    },
    runs,
  };
}

export async function getPromptResults(
  promptId: string,
): Promise<PromptResults | null> {
  const supabase = await createSupabaseServerClient();
  return fetchPromptResultsWithSupabase(supabase, promptId);
}
