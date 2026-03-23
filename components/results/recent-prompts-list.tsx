import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RecentPromptRow } from "@/lib/data/get-recent-prompts";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max).trim()}…`;
}

type Props = {
  prompts: RecentPromptRow[];
};

export function RecentPromptsList({ prompts }: Props) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-3">
      {prompts.map((p) => (
        <li key={p.id}>
          <Link href={`/results/${p.id}`} className="group block">
            <Card className="border-border/80 bg-card/40 transition-colors hover:bg-card/60">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="font-semibold text-foreground">{p.target_brand}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatWhen(p.created_at)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {truncate(p.prompt_text, 160)}
                  </p>
                  {p.runs.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Models:{" "}
                      {p.runs.map((r) => r.model_name).join(", ")}
                    </p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "shrink-0 self-end sm:self-center",
                    "inline-flex gap-1 text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  View
                  <ChevronRight className="size-4" aria-hidden />
                </span>
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
