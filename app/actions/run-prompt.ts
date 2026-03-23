"use server";

import { extractMetrics } from "@/lib/ai/extract-metrics";
import type { ModelKind } from "@/lib/ai/constants";
import { runPrimaryModel } from "@/lib/ai/run-primary";
import {
  normalizeRecommendationContext,
  normalizeSourceCategory,
} from "@/lib/ai/schema";
import { alignMentionsToBrands } from "@/lib/ai/sov";
import { insertPromptAndRuns } from "@/lib/db/persist-run";
import { parseCompetitorsList } from "@/lib/parse-competitors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RunPromptState =
  | { ok: true; promptId: string }
  | { ok: false; error: string };

function formatActionError(e: unknown): string {
  if (!(e instanceof Error)) {
    return "Something went wrong.";
  }
  const m = e.message.trim();
  if (!m) {
    return "Something went wrong.";
  }
  // Undici/fetch when the server closes the connection (often route / serverless timeout).
  if (m.toLowerCase() === "terminated") {
    return "Request was cut off (usually a timeout). Analysis uses web search and can take 1–3 minutes. Try one model at a time, or confirm your host allows long server actions (this app sets maxDuration on the home page).";
  }
  if (/aborted|ECONNRESET|ETIMEDOUT|socket hang up/i.test(m)) {
    return "Network or server connection ended before completion. Try again, or run a single model to shorten the run.";
  }
  return m;
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

export async function runPromptAction(
  _prev: RunPromptState | null,
  formData: FormData,
): Promise<RunPromptState> {
  const promptText = String(formData.get("prompt") ?? "").trim();
  const targetBrand = String(formData.get("targetBrand") ?? "").trim();
  const competitorsRaw = String(formData.get("competitors") ?? "");
  const competitors = parseCompetitorsList(competitorsRaw);
  const models = resolveModels(formData);

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
    const supabase = await createSupabaseServerClient();

    const runsPayload = await Promise.all(
      models.map(async (kind) => {
        const primary = await runPrimaryModel(kind, promptText);
        const extracted = await extractMetrics({
          promptText,
          targetBrand,
          competitors,
          fullResponse: primary.fullResponse,
        });

        const mentions = alignMentionsToBrands(
          targetBrand,
          competitors,
          extracted.mention_counts.map((m) => ({
            brand_name: m.brand_name,
            count: m.count,
            is_target: m.is_target,
          })),
        );

        const recommendationContext = normalizeRecommendationContext(
          extracted.recommendation_context,
        );

        const sources = extracted.sources.map((s) => ({
          url: s.url.trim(),
          category: normalizeSourceCategory(s.category),
        }));

        return {
          modelName: primary.modelLabel,
          fullResponse: primary.fullResponse,
          summary: extracted.summary,
          sentiment: extracted.sentiment,
          recommendationContext,
          mentions,
          sources,
        };
      }),
    );

    const { promptId } = await insertPromptAndRuns(supabase, {
      promptText,
      targetBrand,
      competitors,
      runs: runsPayload.map((r) => ({
        modelName: r.modelName,
        fullResponse: r.fullResponse,
        summary: r.summary,
        sentiment: r.sentiment,
        recommendationContext: r.recommendationContext,
        mentions: r.mentions,
        sources: r.sources,
      })),
    });

    return { ok: true, promptId };
  } catch (e) {
    return { ok: false, error: formatActionError(e) };
  }
}
