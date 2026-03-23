import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PromptTemplateRow = {
  id: string;
  title: string;
  intent: string;
  prompt_text: string;
  target_brand: string;
  competitors: string[];
};

export async function getPromptTemplate(
  id: string,
): Promise<PromptTemplateRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("id, title, intent, prompt_text, target_brand, competitors")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as PromptTemplateRow;
}
