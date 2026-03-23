"use client";

import { useEffect, useState } from "react";

import type { ModelKind } from "@/lib/ai/constants";
import { MODEL_LABELS } from "@/lib/ai/constants";

type Props = {
  promptId: string;
};

export function PartialFailureBanner({ promptId }: Props) {
  const [failed, setFailed] = useState<{ kind: ModelKind; error: string }[]>(
    [],
  );

  useEffect(() => {
    const key = `pm-partial-${promptId}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return;
    }
    sessionStorage.removeItem(key);
    queueMicrotask(() => {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFailed(
            parsed.filter(
              (x): x is { kind: ModelKind; error: string } =>
                x &&
                typeof x === "object" &&
                "kind" in x &&
                "error" in x &&
                (x.kind === "openai" || x.kind === "gemini") &&
                typeof (x as { error: string }).error === "string",
            ),
          );
        }
      } catch {
        /* ignore */
      }
    });
  }, [promptId]);

  if (failed.length === 0) {
    return null;
  }

  return (
    <div
      role="status"
      className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
    >
      <p className="font-medium text-destructive">Some models failed</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
        {failed.map((f) => (
          <li key={f.kind}>
            <span className="font-medium text-foreground">
              {MODEL_LABELS[f.kind]}
            </span>
            : {f.error}
          </li>
        ))}
      </ul>
    </div>
  );
}
