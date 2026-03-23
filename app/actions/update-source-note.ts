"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UpdateSourceNoteState =
  | { ok: true }
  | { ok: false; error: string };

export async function updateSourceNoteAction(
  _prev: UpdateSourceNoteState | null,
  formData: FormData,
): Promise<UpdateSourceNoteState> {
  const sourceId = String(formData.get("sourceId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!sourceId) {
    return { ok: false, error: "Missing source." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("sources")
      .update({ note: note.length > 0 ? note : null })
      .eq("id", sourceId);

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Update failed.",
    };
  }
}
