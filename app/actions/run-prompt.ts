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
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return { ok: false, error: message };
  }
}
