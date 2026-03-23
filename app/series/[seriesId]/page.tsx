import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button-variants";
import { SeriesCharts } from "@/components/series/series-charts";
import { cn } from "@/lib/utils";
import { getSeriesTimeline } from "@/lib/data/get-series-timeline";

type Props = { params: Promise<{ seriesId: string }> };

export default async function SeriesPage({ params }: Props) {
  const { seriesId } = await params;
  const timeline = await getSeriesTimeline(seriesId);
  if (!timeline || timeline.snapshots.length === 0) {
    notFound();
  }

  const last = timeline.snapshots[timeline.snapshots.length - 1];
  const prev =
    timeline.snapshots.length > 1
      ? timeline.snapshots[timeline.snapshots.length - 2]
      : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
        >
          Home
        </Link>
        <Link
          href={`/results/${last.promptId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Latest snapshot
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Prompt series</h1>
        <p className="text-sm text-muted-foreground">
          Series ID <code className="rounded bg-muted px-1 text-xs">{seriesId}</code>{" "}
          — {timeline.snapshots.length} snapshot
          {timeline.snapshots.length === 1 ? "" : "s"}
        </p>
      </header>

      <SeriesCharts timeline={timeline} />

      {prev ? (
        <section className="space-y-3 rounded-xl border border-border/80 bg-muted/10 p-4">
          <h2 className="text-sm font-semibold">Latest vs previous snapshot</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Target SOV (avg)</dt>
              <dd>
                {prev.avgTargetSovPct}% → {last.avgTargetSovPct}%
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Sources cited</dt>
              <dd>
                {prev.sourceCount} → {last.sourceCount}
              </dd>
            </div>
          </dl>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Previous summary
              </p>
              <p className="text-sm">{prev.summarySnippet ?? "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Latest summary
              </p>
              <p className="text-sm">{last.summarySnippet ?? "—"}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <ol className="space-y-3">
          {timeline.snapshots.map((s) => (
            <li
              key={s.promptId}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/60 bg-card/40 px-4 py-3"
            >
              <div>
                <time className="text-xs text-muted-foreground" dateTime={s.createdAt}>
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(s.createdAt))}
                </time>
                <p className="mt-1 max-w-prose text-sm line-clamp-2">{s.promptText}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm tabular-nums">
                <span>SOV {s.avgTargetSovPct}%</span>
                <span>{s.sourceCount} sources</span>
                <Link
                  href={`/results/${s.promptId}`}
                  className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "h-auto p-0",
                  )}
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
