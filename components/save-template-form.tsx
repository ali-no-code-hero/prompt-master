"use client";

import { useActionState } from "react";

import {
  saveTemplateAction,
  type TemplateState,
} from "@/app/actions/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  promptText: string;
  targetBrand: string;
  competitors: string;
};

export function SaveTemplateForm({
  promptText,
  targetBrand,
  competitors,
}: Props) {
  const [state, formAction, pending] = useActionState<
    TemplateState | null,
    FormData
  >(saveTemplateAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-border/80 bg-muted/10 p-4 print:hidden">
      <input type="hidden" name="promptText" value={promptText} />
      <input type="hidden" name="targetBrand" value={targetBrand} />
      <input type="hidden" name="competitors" value={competitors} />
      <div className="space-y-1">
        <Label htmlFor="tpl-title" className="text-xs">
          Save as template
        </Label>
        <Input
          id="tpl-title"
          name="title"
          placeholder="Title"
          className="h-8 w-40 text-sm"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="tpl-intent" className="text-xs">
          Intent
        </Label>
        <Input
          id="tpl-intent"
          name="intent"
          placeholder="e.g. category leader"
          className="h-8 w-44 text-sm"
          required
        />
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Save template"}
      </Button>
      {state?.ok ? (
        <span className="text-xs text-muted-foreground">Saved.</span>
      ) : null}
      {state && !state.ok ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}
