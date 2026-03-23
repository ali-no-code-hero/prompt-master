"use server";

import { checkUrlHttpStatus } from "@/lib/citation/check-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CheckUrlState =
  | { ok: true; status: number | null }
  | { ok: false; error: string };

export async function checkSourceUrlAction(
  _prev: CheckUrlState | null,
  formData: FormData,
): Promise<CheckUrlState> {
  const sourceId = String(formData.get("sourceId") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!sourceId || !url) {
    return { ok: false, error: "Missing source or URL." };
  }

  const status = await checkUrlHttpStatus(url);
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("sources")
      .update({
        http_status: status,
        checked_at: new Date().toISOString(),
      })
      .eq("id", sourceId);

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, status };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Check failed.",
    };
  }
}
