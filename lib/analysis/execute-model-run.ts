import { extractMetrics } from "@/lib/ai/extract-metrics";
import type { ModelKind } from "@/lib/ai/constants";
import { runPrimaryModel } from "@/lib/ai/run-primary";
import {
  normalizeRecommendationContext,
  normalizeSourceCategory,
} from "@/lib/ai/schema";
import {
  alignMentionsToBrands,
  rollUpMentionCountsByAliases,
} from "@/lib/ai/sov";
import type { RunPayload } from "@/lib/db/persist-run";

export async function executeModelRun(input: {
  kind: ModelKind;
  promptText: string;
  targetBrand: string;
  competitors: string[];
  brandAliases?: Record<string, string[]> | null;
}): Promise<RunPayload> {
  const primary = await runPrimaryModel(input.kind, input.promptText);
  const extracted = await extractMetrics({
    promptText: input.promptText,
    targetBrand: input.targetBrand,
    competitors: input.competitors,
    fullResponse: primary.fullResponse,
  });

  let mentionRows = extracted.mention_counts.map((m) => ({
    brand_name: m.brand_name,
    count: m.count,
    is_target: m.is_target,
  }));

  if (input.brandAliases && Object.keys(input.brandAliases).length > 0) {
    mentionRows = rollUpMentionCountsByAliases(
      mentionRows,
      input.targetBrand,
      input.brandAliases,
    );
  }

  const mentions = alignMentionsToBrands(
    input.targetBrand,
    input.competitors,
    mentionRows.map((m) => ({
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
    note: s.note?.trim() ? s.note.trim() : null,
  }));

  return {
    modelName: primary.modelLabel,
    provider: input.kind,
    apiModel: primary.apiModelName,
    usedWebSearch: primary.usedWebSearch,
    metadata: { extraction_model: process.env.EXTRACTION_MODEL ?? "gpt-4o-mini" },
    fullResponse: primary.fullResponse,
    summary: extracted.summary,
    sentiment: extracted.sentiment,
    recommendationContext,
    mentions,
    sources,
  };
}
