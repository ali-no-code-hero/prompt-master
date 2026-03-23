"use server";

import { revalidatePath } from "next/cache";

import { getOptionalUserId } from "@/lib/supabase/get-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TemplateState =
  | { ok: true }
  | { ok: false; error: string };

export async function saveTemplateAction(
  _prev: TemplateState | null,
  formData: FormData,
): Promise<TemplateState> {
  const title = String(formData.get("title") ?? "").trim();
  const intent = String(formData.get("intent") ?? "").trim();
  const promptText = String(formData.get("promptText") ?? "").trim();
  const targetBrand = String(formData.get("targetBrand") ?? "").trim();
  const competitorsRaw = String(formData.get("competitors") ?? "");

  if (!title || !intent || !promptText || !targetBrand) {
    return { ok: false, error: "Title, intent, prompt, and target brand are required." };
  }

  const competitors = competitorsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getOptionalUserId();
    const { error } = await supabase.from("prompt_templates").insert({
      title,
      intent,
      prompt_text: promptText,
      target_brand: targetBrand,
      competitors,
      user_id: userId,
    });

    if (error) {
      return { ok: false, error: error.message };
    }
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Save failed.",
    };
  }
}

export async function deleteTemplateAction(
  _prev: TemplateState | null,
  formData: FormData,
): Promise<TemplateState> {
  const id = String(formData.get("templateId") ?? "").trim();
  if (!id) {
    return { ok: false, error: "Missing template." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("prompt_templates").delete().eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Delete failed.",
    };
  }
}

/** Native `<form action>` wrapper (single FormData argument). */
export async function deleteTemplateFormAction(formData: FormData) {
  await deleteTemplateAction(null, formData);
}
