"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { runPromptAction, type RunPromptState } from "@/app/actions/run-prompt";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-sm text-destructive">{message}</p>;
}

export function PromptForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    RunPromptState | null,
    FormData
  >(runPromptAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.push(`/results/${state.promptId}`);
    }
  }, [state, router]);

  const error = state && !state.ok ? state.error : undefined;

  return (
    <Card className="border-border/80 bg-card/50 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles className="size-5 text-primary" aria-hidden />
          Run prompt analysis
        </CardTitle>
        <CardDescription>
          Compare how OpenAI and Gemini answer your prompt, then review AEO
          metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              name="prompt"
              required
              rows={5}
              placeholder="e.g. What are the best CRM tools for startups in 2025?"
              className="resize-y min-h-[120px]"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetBrand">Target brand</Label>
              <Input
                id="targetBrand"
                name="targetBrand"
                required
                placeholder="Your brand name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitors">Competitor brands (optional)</Label>
              <Input
                id="competitors"
                name="competitors"
                placeholder="Comma-separated: Acme, Contoso"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Models</Label>
            <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="runAll"
                  className={cn(
                    "size-4 rounded border border-input bg-background",
                    "accent-primary",
                  )}
                />
                <span className="text-sm font-medium">Run on all models</span>
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="openai"
                    className="size-4 rounded border border-input accent-primary"
                  />
                  <span className="text-sm">OpenAI</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="gemini"
                    className="size-4 rounded border border-input accent-primary"
                  />
                  <span className="text-sm">Google Gemini</span>
                </label>
              </div>
            </div>
          </div>

          <FieldError message={error} />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Running models…
              </>
            ) : (
              "Analyze prompt"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
