"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";

import { runPromptAction, type RunPromptState } from "@/app/actions/run-prompt";
import { startAnalysisJobAction, type StartJobState } from "@/app/actions/start-analysis-job";
import { AnalysisJobPoller } from "@/components/results/analysis-job-poller";
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
import type { PromptPrefill } from "@/lib/data/get-prompt-prefill";

const EXAMPLE = {
  prompt:
    "What are the best CRM tools for startups in 2025, and which would you recommend first?",
  targetBrand: "ExampleCo CRM",
  competitors: "Salesforce, HubSpot, Pipedrive",
};

type Props = {
  initial: PromptPrefill | null;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-sm text-destructive">{message}</p>;
}

export function PromptForm({ initial }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [aliases, setAliases] = useState(
    () => initial?.brandAliasesJson ?? "{}",
  );

  const [state, formAction, isPending] = useActionState<
    RunPromptState | null,
    FormData
  >(runPromptAction, null);

  useEffect(() => {
    if (state?.ok) {
      if (state.failedModels?.length) {
        sessionStorage.setItem(
          `pm-partial-${state.promptId}`,
          JSON.stringify(state.failedModels),
        );
      }
      router.push(`/results/${state.promptId}`);
    }
  }, [state, router]);

  const syncError = state && !state.ok ? state.error : undefined;

  const defaults = {
    prompt: initial?.promptText ?? "",
    targetBrand: initial?.targetBrand ?? "",
    competitors: initial?.competitors ?? "",
    seriesId: initial?.seriesId ?? "",
  };

  function fillExample() {
    const f = formRef.current;
    if (!f) {
      return;
    }
    (f.elements.namedItem("prompt") as HTMLTextAreaElement).value =
      EXAMPLE.prompt;
    (f.elements.namedItem("targetBrand") as HTMLInputElement).value =
      EXAMPLE.targetBrand;
    (f.elements.namedItem("competitors") as HTMLInputElement).value =
      EXAMPLE.competitors;
    (f.elements.namedItem("runAll") as HTMLInputElement).checked = true;
  }

  function runInBackground() {
    const f = formRef.current;
    if (!f) {
      return;
    }
    const fd = new FormData(f);
    startTransition(async () => {
      const r: StartJobState = await startAnalysisJobAction(null, fd);
      if (r.ok) {
        setJobId(r.jobId);
      } else {
        alert(r.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {jobId ? <AnalysisJobPoller jobId={jobId} /> : null}

      <Card className="border-border/80 bg-card/50 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="size-5 text-primary" aria-hidden />
            Run prompt analysis
          </CardTitle>
          <CardDescription>
            OpenAI and Gemini with web search / grounding. Narrow, comparable
            surfaces—add Claude or Perplexity later via{" "}
            <code className="rounded bg-muted px-1 text-xs">lib/ai</code>{" "}
            adapters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-6">
            <input type="hidden" name="seriesId" value={defaults.seriesId} />
            <input type="hidden" name="brandAliases" value={aliases} />

            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">Try a 2-minute demo</p>
              <p className="mt-1 text-muted-foreground">
                Load a realistic prompt, run both models, then inspect share of
                voice and sources on the results page.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={fillExample}
              >
                Fill example prompt
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                name="prompt"
                required
                rows={5}
                defaultValue={defaults.prompt}
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
                  defaultValue={defaults.targetBrand}
                  placeholder="Your brand name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitors">Competitor brands (optional)</Label>
                <Input
                  id="competitors"
                  name="competitors"
                  defaultValue={defaults.competitors}
                  placeholder="Comma-separated: Acme, Contoso"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                {showAdvanced ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
                Advanced: brand aliases (JSON)
              </button>
              {showAdvanced ? (
                <div className="space-y-2">
                  <Label htmlFor="aliasesVisible">Aliases (also sent as hidden field)</Label>
                  <Textarea
                    id="aliasesVisible"
                    value={aliases}
                    onChange={(e) => setAliases(e.target.value)}
                    rows={4}
                    className="font-mono text-xs"
                    spellCheck={false}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label>Models</Label>
              <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="runAll"
                    defaultChecked
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

            <FieldError message={syncError} />

            <div className="flex flex-wrap gap-3">
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
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isPending}
                onClick={runInBackground}
              >
                Run in background
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
