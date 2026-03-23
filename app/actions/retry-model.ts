"use server";

import { executeModelRun } from "@/lib/analysis/execute-model-run";
import type { ModelKind } from "@/lib/ai/constants";
import { appendRunToPrompt } from "@/lib/db/persist-run";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RetryModelState =
  | { ok: true }
  | { ok: false; error: string };

function formatActionError(e: unknown): string {
  if (!(e instanceof Error)) {
    return "Something went wrong.";
  }
  return e.message.trim() || "Something went wrong.";
}

export async function retryModelForPromptAction(
  _prev: RetryModelState | null,
  formData: FormData,
): Promise<RetryModelState> {
  const promptId = String(formData.get("promptId") ?? "").trim();
  const kind = String(formData.get("modelKind") ?? "").trim() as ModelKind;

  if (!promptId) {
    return { ok: false, error: "Missing prompt." };
  }
  if (kind !== "openai" && kind !== "gemini") {
    return { ok: false, error: "Invalid model." };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: prompt, error: pErr } = await supabase
      .from("prompts")
      .select("prompt_text, target_brand, competitors, brand_aliases")
      .eq("id", promptId)
      .maybeSingle();

    if (pErr || !prompt) {
      return { ok: false, error: pErr?.message ?? "Prompt not found." };
    }

    const { data: existing } = await supabase
      .from("ai_runs")
      .select("id")
      .eq("prompt_id", promptId)
      .eq("provider", kind)
      .maybeSingle();

    if (existing) {
      return {
        ok: false,
        error: `A ${kind} run already exists for this analysis. Open the results page to view it.`,
      };
    }

    const competitors = prompt.competitors ?? [];
    let brandAliases: Record<string, string[]> | null = null;
    const raw = prompt.brand_aliases;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const obj: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
          obj[k] = v as string[];
        }
      }
      if (Object.keys(obj).length > 0) {
        brandAliases = obj;
      }
    }

    const run = await executeModelRun({
      kind,
      promptText: prompt.prompt_text,
      targetBrand: prompt.target_brand,
      competitors,
      brandAliases,
    });

    await appendRunToPrompt(supabase, {
      promptId,
      run: {
        modelName: run.modelName,
        provider: run.provider,
        apiModel: run.apiModel,
        usedWebSearch: run.usedWebSearch,
        metadata: run.metadata,
        fullResponse: run.fullResponse,
        summary: run.summary,
        sentiment: run.sentiment,
        recommendationContext: run.recommendationContext,
        mentions: run.mentions,
        sources: run.sources,
      },
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatActionError(e) };
  }
}
