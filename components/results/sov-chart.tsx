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
    </div>
  );
}
