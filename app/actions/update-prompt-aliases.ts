"use server";

import type { Json } from "@/types/database";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UpdateAliasesState =
  | { ok: true }
  | { ok: false; error: string };

function parseAliasesJson(raw: string): Record<string, string[]> | null {
  const t = raw.trim();
  if (!t) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(t);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
        out[k] = v as string[];
      }
    }
    return out;
  } catch {
    return null;
  }
}

export async function updatePromptAliasesAction(
  _prev: UpdateAliasesState | null,
  formData: FormData,
): Promise<UpdateAliasesState> {
  const promptId = String(formData.get("promptId") ?? "").trim();
  const raw = String(formData.get("aliasesJson") ?? "");

  if (!promptId) {
    return { ok: false, error: "Missing prompt." };
  }

  const parsed = parseAliasesJson(raw);
  if (parsed === null) {
    return { ok: false, error: "Invalid JSON for aliases." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("prompts")
      .update({ brand_aliases: parsed as Json })
      .eq("id", promptId);

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
