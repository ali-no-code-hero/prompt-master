"use server";

import { after } from "next/server";

import { runPromptPipeline } from "@/lib/analysis/run-prompt-pipeline";
import { MODEL_KINDS, type ModelKind } from "@/lib/ai/constants";
import { parseCompetitorsList } from "@/lib/parse-competitors";
import { getOptionalUserId } from "@/lib/supabase/get-user";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export type StartJobState =
  | { ok: true; jobId: string }
  | { ok: false; error: string };

type JobPayload = {
  promptText: string;
  targetBrand: string;
  competitors: string[];
  models: ModelKind[];
  seriesId?: string | null;
  brandAliases?: Record<string, string[]> | null;
  userId: string | null;
};

function resolveModels(formData: FormData): ModelKind[] {
  const runAll = formData.get("runAll") === "on";
  if (runAll) {
    return [...MODEL_KINDS];
  }
  const models: ModelKind[] = [];
  if (formData.get("openai") === "on") {
    models.push("openai");
  }
  if (formData.get("gemini") === "on") {
    models.push("gemini");
  }
  if (formData.get("perplexity") === "on") {
    models.push("perplexity");
  }
  return models;
}

function parseBrandAliases(raw: string): Record<string, string[]> | null {
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

export async function startAnalysisJobAction(
  _prev: StartJobState | null,
  formData: FormData,
): Promise<StartJobState> {
  try {
    createSupabaseServiceRoleClient();
  } catch {
    return {
      ok: false,
      error:
        "Background jobs require SUPABASE_SERVICE_ROLE_KEY on the server. Use the standard Analyze button or add the service role key.",
    };
  }

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

  const userId = await getOptionalUserId();
  const payload: JobPayload = {
    promptText,
    targetBrand,
    competitors,
    models,
    seriesId: seriesId ?? null,
    brandAliases: brandAliases ?? null,
    userId,
  };

  const supabase = await createSupabaseServerClient();
  const { data: job, error: jobErr } = await supabase
    .from("analysis_jobs")
    .insert({
      status: "pending",
      payload: payload as unknown as Json,
    })
    .select("id")
    .single();

  if (jobErr || !job) {
    return { ok: false, error: jobErr?.message ?? "Failed to create job." };
  }

  const jobId = job.id;
  const payloadSnapshot = payload;

  after(async () => {
    const admin = createSupabaseServiceRoleClient();
    const now = new Date().toISOString();
    await admin
      .from("analysis_jobs")
      .update({ status: "running", updated_at: now })
      .eq("id", jobId);
    try {
      const { promptId } = await runPromptPipeline(
        {
          promptText: payloadSnapshot.promptText,
          targetBrand: payloadSnapshot.targetBrand,
          competitors: payloadSnapshot.competitors,
          models: payloadSnapshot.models,
          seriesId: payloadSnapshot.seriesId ?? null,
          brandAliases: payloadSnapshot.brandAliases ?? null,
          userId: payloadSnapshot.userId,
        },
        { supabase: admin },
      );
      await admin
        .from("analysis_jobs")
        .update({
          status: "completed",
          result_prompt_id: promptId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Job failed.";
      await admin
        .from("analysis_jobs")
        .update({
          status: "failed",
          error: msg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    }
  });

  return { ok: true, jobId };
}
