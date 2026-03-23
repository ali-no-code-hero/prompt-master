"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  updatePromptAliasesAction,
  type UpdateAliasesState,
} from "@/app/actions/update-prompt-aliases";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  promptId: string;
  initialJson: string;
};

export function BrandAliasesForm({ promptId, initialJson }: Props) {
  const router = useRouter();
  const [json, setJson] = useState(initialJson);
  const [state, formAction, pending] = useActionState<
    UpdateAliasesState | null,
    FormData
  >(updatePromptAliasesAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-border/80 bg-muted/10 p-4">
      <input type="hidden" name="promptId" value={promptId} />
      <Label htmlFor="aliasesJson" className="text-sm font-medium">
        Brand aliases (JSON)
      </Label>
      <p className="text-xs text-muted-foreground">
        Map canonical names to alternates, e.g.{" "}
        <code className="rounded bg-muted px-1">
          {`{"Acme": ["Acme Inc", "ACME Corp"]}`}
        </code>
        . Counts from the model answer are merged into the canonical label before
        share-of-voice.
      </p>
      <Textarea
        id="aliasesJson"
        name="aliasesJson"
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={4}
        className="font-mono text-xs"
        spellCheck={false}
      />
      <Button type="submit" size="sm" disabled={pending}>
        Save aliases
      </Button>
      {state && !state.ok ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-muted-foreground">Saved. Re-run a snapshot to refresh counts.</p>
      ) : null}
    </form>
  );
}
