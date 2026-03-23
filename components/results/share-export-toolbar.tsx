"use client";

import { useActionState } from "react";

import {
  createShareLinkAction,
  type CreateShareState,
} from "@/app/actions/create-share-link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  promptId: string;
};

export function ShareExportToolbar({ promptId }: Props) {
  const [state, formAction, pending] = useActionState<
    CreateShareState | null,
    FormData
  >(createShareLinkAction, null);

  function copyShareUrl() {
    if (!state?.ok || typeof window === "undefined") {
      return;
    }
    const full = `${window.location.origin}${state.urlPath}`;
    void navigator.clipboard.writeText(full);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <a
        href={`/api/export/prompt/${promptId}/csv`}
        download
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Download CSV
      </a>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
      >
        Print / PDF
      </Button>
      <form action={formAction} className="inline-flex items-center gap-2">
        <input type="hidden" name="promptId" value={promptId} />
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? "Creating…" : "Create share link"}
        </Button>
      </form>
      {state?.ok ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <code className="max-w-[min(100%,20rem)] truncate rounded bg-muted px-1 py-0.5">
            {state.urlPath}
          </code>
          <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={copyShareUrl}>
            Copy full URL
          </Button>
        </div>
      ) : null}
      {state && !state.ok ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </div>
  );
}
