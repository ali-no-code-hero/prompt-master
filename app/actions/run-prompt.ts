"use server";

import { runPromptPipeline } from "@/lib/analysis/run-prompt-pipeline";
import type { ModelKind } from "@/lib/ai/constants";
import { parseCompetitorsList } from "@/lib/parse-competitors";
import { getOptionalUserId } from "@/lib/supabase/get-user";

export type RunPromptState =
  | {
      ok: true;
      promptId: string;
      failedModels?: { kind: ModelKind; error: string }[];
    }
  | { ok: false; error: string };

function formatActionError(e: unknown): string {
  if (!(e instanceof Error)) {
    return "Something went wrong.";
  }
  return e.message.trim() || "Something went wrong.";
}

function resolveModels(formData: FormData): ModelKind[] {
  const runAll = formData.get("runAll") === "on";
  if (runAll) {
    return ["openai", "gemini"];
  }
  const models: ModelKind[] = [];
  if (formData.get("openai") === "on") {
    models.push("openai");
  }
  if (formData.get("gemini") === "on") {
    models.push("gemini");
  }
  return models;
}

function parseBrandAliases(
  raw: string,
): Record<string, string[]> | null {
  const t = raw.trim();
  if (!t) {
    return null;
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
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}

export async function runPromptAction(
  _prev: RunPromptState | null,
  formData: FormData,
): Promise<RunPromptState> {
  const promptText = String(formData.get("prompt") ?? "").trim();
  const targetBrand = String(formData.get("targetBrand") ?? "").trim();
  const competitorsRaw = String(formData.get("competitors") ?? "");
  const competitors = parseCompetitorsList(competitorsRaw);
  const models = resolveModels(formData);
  const seriesIdRaw = String(formData.get("seriesId") ?? "").trim();
  const seriesId = seriesIdRaw || undefined;
  const brandAliases =
    parseBrandAliases(String(formData.get("brandAliases") ?? "")) ?? undefined;

  if (!promptText) {
    return { ok: false, error: "Prompt is required." };
  }
  if (!targetBrand) {
    return { ok: false, error: "Target brand is required." };
  }
  if (models.length === 0) {
    return { ok: false, error: "Select at least one AI model or Run on all." };
  }

  try {
    const userId = await getOptionalUserId();
    const { promptId, failedModels } = await runPromptPipeline({
      promptText,
      targetBrand,
      competitors,
      models,
      seriesId: seriesId ?? null,
      brandAliases: brandAliases ?? null,
      userId,
    });

    return {
      ok: true,
      promptId,
      failedModels: failedModels.length > 0 ? failedModels : undefined,
    };
  } catch (e) {
    return { ok: false, error: formatActionError(e) };
  }
}
