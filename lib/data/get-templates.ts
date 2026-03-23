import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TemplateRow = {
  id: string;
  title: string;
  intent: string;
  prompt_text: string;
  target_brand: string;
  competitors: string[];
  created_at: string;
};

export async function getPromptTemplates(): Promise<TemplateRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("prompt_templates")
    .select(
      "id, title, intent, prompt_text, target_brand, competitors, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TemplateRow[];
}
