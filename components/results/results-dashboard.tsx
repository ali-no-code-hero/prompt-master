import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTip } from "@/components/ui/help-tip";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { MODEL_KINDS, type ModelKind } from "@/lib/ai/constants";

import { BrandAliasesForm } from "@/components/results/brand-aliases-form";
import { SaveTemplateForm } from "@/components/save-template-form";
import { MetricsCards } from "@/components/results/metrics-cards";
import { PartialFailureBanner } from "@/components/results/partial-failure-banner";
import { ResponsePanels } from "@/components/results/response-panels";
import { RetryModelPanel } from "@/components/results/retry-model-panel";
import { ShareExportToolbar } from "@/components/results/share-export-toolbar";
import { SovChart } from "@/components/results/sov-chart";
import { SovDataTable } from "@/components/results/sov-data-table";
import { SovGroupedBarChart } from "@/components/results/sov-grouped-bar-chart";
import { SourcesTable } from "@/components/results/sources-table";

import type { PromptResults } from "@/lib/data/get-prompt-results";

type Props = {
  data: PromptResults;
  readOnly?: boolean;
};

function formatRunAt(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function RunDetails({
  run,
}: {
  run: PromptResults["runs"][number];
}) {
  const metaStr =
    run.metadata && typeof run.metadata === "object"
      ? JSON.stringify(run.metadata, null, 2)
      : run.metadata != null
        ? String(run.metadata)
        : null;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
      <dl className="grid gap-1 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground/80">Provider</dt>
          <dd>{run.provider ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground/80">API model</dt>
          <dd className="break-all">{run.api_model ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground/80">Web search / grounding</dt>
          <dd>
            {run.used_web_search == null
              ? "—"
              : run.used_web_search
                ? "On"
                : "Off"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground/80">Run time (UTC stored)</dt>
          <dd>
            <time dateTime={run.created_at}>{run.created_at}</time>
            <span className="ml-1 text-muted-foreground">
              ({formatRunAt(run.created_at)} local)
            </span>
          </dd>
        </div>
      </dl>
      {metaStr ? (
        <pre className="mt-2 max-h-24 overflow-auto rounded border border-border/50 bg-background/80 p-2 font-mono text-[10px] leading-tight">
          {metaStr}
        </pre>
      ) : null}
    </div>
  );
}

function RunColumn({
  run,
  readOnly,
}: {
  run: PromptResults["runs"][number];
  readOnly: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Model</h3>
        <p className="text-base font-semibold tracking-tight">{run.model_name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRunAt(run.created_at)}
        </p>
      </div>
      <RunDetails run={run} />
      <MetricsCards
        sentiment={run.sentiment}
        recommendationContext={run.recommendation_context}
      />
      <div>
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
          <HelpTip label="Share of voice is the percentage of counted brand mentions in this model answer that belong to each tracked brand. We align counts to your target and competitor list (exact name match after normalization); use aliases below to merge variants.">
            Share of voice
          </HelpTip>
        </h4>
        <p className="mb-3 text-xs text-muted-foreground">
          Counts are tied to the exact brand labels you entered unless you define
          aliases. See the numeric table for an accessible breakdown.
        </p>
        <SovChart mentions={run.brand_mentions} />
        <div className="mt-4">
          <SovDataTable
            mentions={run.brand_mentions}
            caption="Share of voice by brand for this model run"
          />
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
          <HelpTip label="URLs the model cited or that were attached from web search / grounding. ‘Generic domain’ highlights common aggregators; it does not mean the link is wrong.">
            Sources & provenance
          </HelpTip>
        </h4>
        <SourcesTable sources={run.sources} readOnly={readOnly} />
      </div>
      <Separator className="bg-border/60" />
      <div>
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
          Response
        </h4>
        <ResponsePanels summary={run.summary} fullResponse={run.full_response} />
      </div>
    </div>
  );
}

export function ResultsDashboard({ data, readOnly = false }: Props) {
  const multi = data.runs.length > 1;
  const providersPresent = new Set(
    data.runs.map((r) => r.provider).filter(Boolean) as string[],
  );
  const allKinds: ModelKind[] = [...MODEL_KINDS];
  const missingModels = allKinds.filter((k) => !providersPresent.has(k));
  const aliasesJson = JSON.stringify(data.prompt.brand_aliases ?? {}, null, 2);

  return (
    <div className="space-y-8">
      {readOnly ? null : (
        <PartialFailureBanner promptId={data.prompt.id} />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Target brand</p>
          <p className="text-xl font-semibold">{data.prompt.target_brand}</p>
          {data.prompt.competitors.length > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Competitors: {data.prompt.competitors.join(", ")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          {readOnly ? null : <ShareExportToolbar promptId={data.prompt.id} />}
        </div>
      </div>

      {readOnly ? null : (
        <RetryModelPanel
          promptId={data.prompt.id}
          missingModels={missingModels}
        />
      )}

      <div className="flex flex-wrap gap-2 text-sm print:hidden">
        <Link
          href={`/series/${data.prompt.series_id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Series timeline
        </Link>
        {readOnly ? null : (
          <Link
            href={`/?rerunFrom=${data.prompt.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            New snapshot (same series)
          </Link>
        )}
      </div>

      {readOnly ? null : (
        <BrandAliasesForm promptId={data.prompt.id} initialJson={aliasesJson} />
      )}

      <Card className="border-border/80 bg-card/40">
        <CardHeader>
          <CardTitle className="text-base">Prompt</CardTitle>
          <CardDescription className="text-foreground/90">
            {data.prompt.prompt_text}
          </CardDescription>
        </CardHeader>
      </Card>

      {readOnly ? null : (
        <SaveTemplateForm
          promptText={data.prompt.prompt_text}
          targetBrand={data.prompt.target_brand}
          competitors={data.prompt.competitors.join(", ")}
        />
      )}

      {multi && data.runs.filter((r) => r.provider).length >= 2 ? (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Model comparison (share of voice %)
          </h3>
          <SovGroupedBarChart runs={data.runs} />
        </div>
      ) : null}

      <div
        className={
          multi
            ? "grid gap-10 lg:grid-cols-2 lg:gap-12"
            : "grid gap-10"
        }
      >
        {data.runs.map((run) => (
          <Card
            key={run.id}
            className="border-border/80 bg-card/30 p-6 shadow-none"
          >
            <CardContent className="p-0">
              <RunColumn run={run} readOnly={readOnly} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
