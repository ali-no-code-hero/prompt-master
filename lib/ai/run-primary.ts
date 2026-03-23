import type { ModelKind } from "@/lib/ai/constants";
import { MODEL_LABELS } from "@/lib/ai/constants";
import { runGeminiPrimary } from "@/lib/ai/gemini";
import { runOpenAIPrimary } from "@/lib/ai/openai";

export async function runPrimaryModel(
  kind: ModelKind,
  promptText: string,
): Promise<{ modelLabel: string; fullResponse: string; apiModelName: string }> {
  if (kind === "openai") {
    const fullResponse = await runOpenAIPrimary(promptText);
    const apiModelName =
      process.env.OPENAI_PRIMARY_MODEL ?? "gpt-4o-mini";
    return {
      modelLabel: `${MODEL_LABELS.openai} (${apiModelName})`,
      fullResponse,
      apiModelName,
    };
  }

  const fullResponse = await runGeminiPrimary(promptText);
  const apiModelName =
    process.env.GEMINI_PRIMARY_MODEL ?? "gemini-2.5-flash";
  return {
    modelLabel: `${MODEL_LABELS.gemini} (${apiModelName})`,
    fullResponse,
    apiModelName,
  };
}
