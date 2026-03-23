"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { sovPercentages } from "@/lib/ai/sov";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type Mention = {
  brand_name: string;
  mention_count: number;
  is_target: boolean;
};

type Props = {
  mentions: Mention[];
};

export function SovChart({ mentions }: Props) {
  const breakdown = sovPercentages(mentions);
  const colorByBrand = new Map(
    breakdown.map((m, i) => [m.brand_name, COLORS[i % COLORS.length]]),
  );

  const pieData = breakdown
    .filter((m) => m.mention_count > 0)
    .map((m) => ({
      name: m.brand_name,
      value: m.share_pct,
      mentions: m.mention_count,
      isTarget: m.is_target,
      fill: colorByBrand.get(m.brand_name) ?? COLORS[0],
    }));

  const hasData = breakdown.some((m) => m.mention_count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border/80 text-sm text-muted-foreground">
        No mention counts to chart yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={96}
              paddingAngle={2}
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.fill}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => {
                const v = typeof value === "number" ? value : Number(value);
                const mentionN = (item as { payload?: { mentions?: number } })
                  ?.payload?.mentions;
                return [`${v}% (${mentionN ?? 0} mentions)`, "Share"];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-border/80 bg-muted/15 px-3 py-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Mention breakdown
        </p>
        <ul className="space-y-2">
          {breakdown.map((m) => {
            const fill = colorByBrand.get(m.brand_name) ?? COLORS[0];
            const label = m.is_target ? "Your brand" : "Competitor";
            return (
              <li
                key={m.brand_name}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-start gap-2">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: fill }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block font-medium leading-tight">
                      {m.brand_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-right">
                  <span className="block font-medium">
                    {m.mention_count}{" "}
                    {m.mention_count === 1 ? "mention" : "mentions"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.share_pct}% share
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
