"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MODEL_LABELS, type ModelKind } from "@/lib/ai/constants";
import { sovPercentages } from "@/lib/ai/sov";

import type { PromptResults } from "@/lib/data/get-prompt-results";

type Props = {
  runs: PromptResults["runs"];
};

export function SovGroupedBarChart({ runs }: Props) {
  if (runs.length < 2) {
    return null;
  }

  const byProvider = new Map<string, PromptResults["runs"][number]>();
  for (const r of runs) {
    if (r.provider) {
      byProvider.set(r.provider, r);
    }
  }

  if (byProvider.size < 2) {
    return null;
  }

  const providers = [...byProvider.keys()].sort();
  const brandKeys = new Set<string>();
  for (const r of byProvider.values()) {
    for (const m of r.brand_mentions) {
      brandKeys.add(m.brand_name);
    }
  }
  const brands = [...brandKeys];

  const data = brands.map((brand) => {
    const row: Record<string, string | number> = { brand };
    for (const p of providers) {
      const run = byProvider.get(p)!;
      const pct =
        sovPercentages(run.brand_mentions).find((x) => x.brand_name === brand)
          ?.share_pct ?? 0;
      row[p] = pct;
    }
    return row;
  });

  const colors: Record<string, string> = {
    openai: "var(--chart-1)",
    gemini: "var(--chart-2)",
    perplexity: "var(--chart-3)",
  };

  return (
    <div className="h-[320px] w-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
          <XAxis
            dataKey="brand"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={64}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => {
              const v =
                value == null
                  ? 0
                  : typeof value === "number"
                    ? value
                    : Number(value);
              return `${Number.isFinite(v) ? v : 0}% SOV`;
            }}
          />
          <Legend />
          {providers.map((p) => (
            <Bar
              key={p}
              dataKey={p}
              name={
                p in MODEL_LABELS
                  ? MODEL_LABELS[p as ModelKind]
                  : p
              }
              fill={colors[p] ?? "var(--chart-3)"}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
