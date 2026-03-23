import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RecentPromptRow = {
  id: string;
  prompt_text: string;
  target_brand: string;
  series_id: string;
  created_at: string;
  runs: {
    id: string;
    model_name: string;
    created_at: string;
  }[];
};

const MAX_RECENT = 30;

export async function getRecentPrompts(): Promise<RecentPromptRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("prompts")
    .select(
      `
      id,
      prompt_text,
      target_brand,
      series_id,
      created_at,
      ai_runs ( id, model_name, created_at )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(MAX_RECENT);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      prompt_text: string;
      target_brand: string;
      series_id: string;
      created_at: string;
      ai_runs:
        | { id: string; model_name: string; created_at: string }[]
        | null;
    };
    const runs = (r.ai_runs ?? []).slice().sort((a, b) => {
      const t = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return t;
    });
    return {
      id: r.id,
      prompt_text: r.prompt_text,
      target_brand: r.target_brand,
      series_id: r.series_id,
      created_at: r.created_at,
      runs,
    };
  });
}
