"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SeriesTimelineData } from "@/lib/data/get-series-timeline";

type Props = {
  timeline: SeriesTimelineData;
};

export function SeriesCharts({ timeline }: Props) {
  const lineData = timeline.snapshots.map((s) => ({
    t: new Date(s.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    sov: s.avgTargetSovPct,
  }));

  const barData = timeline.domainAgg.map((d) => ({
    name: d.domain.length > 28 ? `${d.domain.slice(0, 26)}…` : d.domain,
    count: d.count,
  }));

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Target share of voice over snapshots
        </h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Averaged across model runs in each snapshot (same prompt series).
        </p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sov"
                name="Target SOV %"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Top citation domains (series)
        </h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={108}
                tick={{ fontSize: 10 }}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                name="Citations"
                fill="var(--chart-2)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
