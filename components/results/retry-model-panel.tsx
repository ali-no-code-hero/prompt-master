"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  retryModelForPromptAction,
  type RetryModelState,
} from "@/app/actions/retry-model";
import type { ModelKind } from "@/lib/ai/constants";
import { MODEL_LABELS } from "@/lib/ai/constants";
import { Button } from "@/components/ui/button";

type Props = {
  promptId: string;
  missingModels: ModelKind[];
};

export function RetryModelPanel({ promptId, missingModels }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    RetryModelState | null,
    FormData
  >(retryModelForPromptAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  if (missingModels.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
      <p className="text-sm font-medium text-foreground">
        Finish this analysis
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Run the remaining model for this snapshot. Each model is saved once per
        analysis.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {missingModels.map((kind) => (
          <li key={kind}>
            <form action={formAction} className="inline">
              <input type="hidden" name="promptId" value={promptId} />
              <input type="hidden" name="modelKind" value={kind} />
              <Button type="submit" size="sm" disabled={pending}>
                {pending
                  ? "Running…"
                  : `Run ${MODEL_LABELS[kind]}`}
              </Button>
            </form>
          </li>
        ))}
      </ul>
      {state && !state.ok ? (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      ) : null}
    </div>
  );
}
