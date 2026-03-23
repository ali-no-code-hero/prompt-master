import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PromptPrefill = {
  promptText: string;
  targetBrand: string;
  competitors: string;
  seriesId: string;
  brandAliasesJson: string;
};

function asBrandAliasesJson(raw: unknown): string {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return "{}";
  }
  return JSON.stringify(raw);
}

export async function getPromptPrefill(
  promptId: string,
): Promise<PromptPrefill | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("prompts")
    .select("prompt_text, target_brand, competitors, series_id, brand_aliases")
    .eq("id", promptId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    promptText: data.prompt_text,
    targetBrand: data.target_brand,
    competitors: (data.competitors ?? []).join(", "),
    seriesId: data.series_id,
    brandAliasesJson: asBrandAliasesJson(data.brand_aliases),
  };
}
