import type { SupabaseClient } from "@supabase/supabase-js";

import { executeModelRun } from "@/lib/analysis/execute-model-run";
import type { ModelKind } from "@/lib/ai/constants";
import { insertPromptAndRuns } from "@/lib/db/persist-run";
import type { Database } from "@/types/database";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RunPipelineInput = {
  promptText: string;
  targetBrand: string;
  competitors: string[];
  models: ModelKind[];
  seriesId?: string | null;
  brandAliases?: Record<string, string[]> | null;
  userId?: string | null;
};

function formatActionError(e: unknown): string {
  if (!(e instanceof Error)) {
    return "Something went wrong.";
  }
  const m = e.message.trim();
  if (!m) {
    return "Something went wrong.";
  }
  if (m.toLowerCase() === "terminated") {
    return "Request was cut off (usually a timeout). Analysis uses web search and can take 1–3 minutes. Try one model at a time, or confirm your host allows long server actions (this app sets maxDuration on the home page).";
  }
  if (/aborted|ECONNRESET|ETIMEDOUT|socket hang up/i.test(m)) {
    return "Network or server connection ended before completion. Try again, or run a single model to shorten the run.";
  }
  return m;
}

export async function runPromptPipeline(
  input: RunPipelineInput,
  options?: {
    supabase?: SupabaseClient<Database>;
  },
): Promise<{
  promptId: string;
  failedModels: { kind: ModelKind; error: string }[];
}> {
  const results = await Promise.all(
    input.models.map(async (kind) => {
      try {
        const payload = await executeModelRun({
          kind,
          promptText: input.promptText,
          targetBrand: input.targetBrand,
          competitors: input.competitors,
          brandAliases: input.brandAliases ?? null,
        });
        return { ok: true as const, kind, payload };
      } catch (e) {
        return {
          ok: false as const,
          kind,
          error: formatActionError(e),
        };
      }
    }),
  );

  const successes = results.filter((r) => r.ok);
  const failures = results.filter((r) => !r.ok);

  if (successes.length === 0) {
    const msg = failures.map((f) => `${f.kind}: ${f.error}`).join(" ");
    throw new Error(msg || "All selected models failed.");
  }

  const supabase =
    options?.supabase ?? (await createSupabaseServerClient());

  const runsPayload = successes.map((s) => {
    if (!s.ok) {
      throw new Error("unreachable");
    }
    return s.payload;
  });

  const { promptId } = await insertPromptAndRuns(supabase, {
    promptText: input.promptText,
    targetBrand: input.targetBrand,
    competitors: input.competitors,
    seriesId: input.seriesId ?? null,
    brandAliases: input.brandAliases ?? null,
    userId: input.userId ?? null,
    runs: runsPayload.map((r) => ({
      modelName: r.modelName,
      provider: r.provider,
      apiModel: r.apiModel,
      usedWebSearch: r.usedWebSearch,
      metadata: r.metadata,
      fullResponse: r.fullResponse,
      summary: r.summary,
      sentiment: r.sentiment,
      recommendationContext: r.recommendationContext,
      mentions: r.mentions,
      sources: r.sources,
    })),
  });

  return {
    promptId,
    failedModels: failures.map((f) => ({ kind: f.kind, error: f.error })),
  };
}
