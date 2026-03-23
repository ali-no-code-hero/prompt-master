import type { ModelKind } from "@/lib/ai/constants";
import {
  DEFAULT_GEMINI_PRIMARY_MODEL,
  DEFAULT_OPENAI_PRIMARY_MODEL,
  DEFAULT_PERPLEXITY_PRIMARY_MODEL,
  MODEL_LABELS,
} from "@/lib/ai/constants";
import { runGeminiPrimary } from "@/lib/ai/gemini";
import { runOpenAIPrimary } from "@/lib/ai/openai";
import { runPerplexityPrimary } from "@/lib/ai/perplexity";

export async function runPrimaryModel(
  kind: ModelKind,
  promptText: string,
): Promise<{
  modelLabel: string;
  fullResponse: string;
  apiModelName: string;
  usedWebSearch: boolean;
}> {
  if (kind === "openai") {
    const fullResponse = await runOpenAIPrimary(promptText);
    const apiModelName =
      process.env.OPENAI_PRIMARY_MODEL ?? DEFAULT_OPENAI_PRIMARY_MODEL;
    return {
      modelLabel: `${MODEL_LABELS.openai} (${apiModelName})`,
      fullResponse,
      apiModelName,
      usedWebSearch: true,
    };
  }

  if (kind === "perplexity") {
    const fullResponse = await runPerplexityPrimary(promptText);
    const apiModelName =
      process.env.PERPLEXITY_PRIMARY_MODEL ?? DEFAULT_PERPLEXITY_PRIMARY_MODEL;
    return {
      modelLabel: `${MODEL_LABELS.perplexity} (${apiModelName})`,
      fullResponse,
      apiModelName,
      usedWebSearch: true,
    };
  }

  const fullResponse = await runGeminiPrimary(promptText);
  const apiModelName =
    process.env.GEMINI_PRIMARY_MODEL ?? DEFAULT_GEMINI_PRIMARY_MODEL;
  return {
    modelLabel: `${MODEL_LABELS.gemini} (${apiModelName})`,
    fullResponse,
    apiModelName,
    usedWebSearch: true,
  };
}
