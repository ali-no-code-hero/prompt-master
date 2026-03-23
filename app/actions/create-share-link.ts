"use server";

import { randomBytes } from "node:crypto";

import { hashShareToken } from "@/lib/share/hash-token";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CreateShareState =
  | { ok: true; urlPath: string }
  | { ok: false; error: string };

export async function createShareLinkAction(
  _prev: CreateShareState | null,
  formData: FormData,
): Promise<CreateShareState> {
  const promptId = String(formData.get("promptId") ?? "").trim();
  if (!promptId) {
    return { ok: false, error: "Missing prompt." };
  }

  const raw = randomBytes(24).toString("base64url");
  const token_hash = hashShareToken(raw);

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("share_tokens").insert({
      prompt_id: promptId,
      token_hash,
      expires_at: null,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, urlPath: `/share/${raw}` };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not create link.",
    };
  }
}
