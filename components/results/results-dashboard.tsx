import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { MetricsCards } from "@/components/results/metrics-cards";
import { ResponsePanels } from "@/components/results/response-panels";
import { SovChart } from "@/components/results/sov-chart";
import { SourcesTable } from "@/components/results/sources-table";

import type { PromptResults } from "@/lib/data/get-prompt-results";

type Props = {
  data: PromptResults;
};

function formatRunAt(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function RunColumn({
  run,
}: {
  run: PromptResults["runs"][number];
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
      <MetricsCards
        sentiment={run.sentiment}
        recommendationContext={run.recommendation_context}
      />
      <div>
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
          Share of voice
        </h4>
        <SovChart mentions={run.brand_mentions} />
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
          Sources cited
        </h4>
        <SourcesTable sources={run.sources} />
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

export function ResultsDashboard({ data }: Props) {
  const multi = data.runs.length > 1;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Target brand</p>
        <p className="text-xl font-semibold">{data.prompt.target_brand}</p>
        {data.prompt.competitors.length > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Competitors: {data.prompt.competitors.join(", ")}
          </p>
        ) : null}
      </div>

      <Card className="border-border/80 bg-card/40">
        <CardHeader>
          <CardTitle className="text-base">Prompt</CardTitle>
          <CardDescription className="text-foreground/90">
            {data.prompt.prompt_text}
          </CardDescription>
        </CardHeader>
      </Card>

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
              <RunColumn run={run} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
