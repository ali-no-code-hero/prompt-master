import { alignMentionsToBrands, sovPercentages } from "@/lib/ai/sov";
import { isGenericSourceHost } from "@/lib/citation/generic-domains";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type SeriesSnapshot = {
  promptId: string;
  createdAt: string;
  promptText: string;
  avgTargetSovPct: number;
  sourceCount: number;
  summarySnippet: string | null;
  providers: string[];
};

export type DomainAgg = { domain: string; count: number; generic: boolean };

export type SeriesTimelineData = {
  seriesId: string;
  snapshots: SeriesSnapshot[];
  domainAgg: DomainAgg[];
};

function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function getSeriesTimeline(
  seriesId: string,
): Promise<SeriesTimelineData | null> {
  const supabase = await createSupabaseServerClient();

  const { data: prompts, error: pErr } = await supabase
    .from("prompts")
    .select("id, prompt_text, target_brand, competitors, created_at")
    .eq("series_id", seriesId)
    .order("created_at", { ascending: true });

  if (pErr || !prompts?.length) {
    return null;
  }

  const promptRows = prompts as Pick<
    Tables<"prompts">,
    "id" | "prompt_text" | "target_brand" | "competitors" | "created_at"
  >[];

  const promptIds = promptRows.map((p) => p.id);

  const { data: runsRaw, error: rErr } = await supabase
    .from("ai_runs")
    .select(
      `
      id,
      prompt_id,
      provider,
      summary,
      created_at,
      brand_mentions ( brand_name, mention_count, is_target ),
      sources ( url )
    `,
    )
    .in("prompt_id", promptIds)
    .order("created_at", { ascending: true });

  if (rErr) {
    throw new Error(rErr.message);
  }

  const runs = runsRaw ?? [];
  const runsByPrompt = new Map<string, typeof runs>();
  for (const row of runs) {
    const r = row as { prompt_id: string };
    const list = runsByPrompt.get(r.prompt_id) ?? [];
    list.push(row);
    runsByPrompt.set(r.prompt_id, list);
  }

  const domainCounts = new Map<string, { count: number; generic: boolean }>();

  const snapshots: SeriesSnapshot[] = promptRows.map((p) => {
    const pruns = runsByPrompt.get(p.id) ?? [];
    const providers = [
      ...new Set(
        pruns
          .map((x) => (x as { provider: string | null }).provider)
          .filter(Boolean),
      ),
    ] as string[];

    let sovSum = 0;
    let sovN = 0;
    let sourceCount = 0;
    let summarySnippet: string | null = null;

    for (const raw of pruns) {
      const run = raw as {
        summary: string | null;
        brand_mentions: {
          brand_name: string;
          mention_count: number;
          is_target: boolean;
        }[] | null;
        sources: { url: string }[] | null;
      };

      if (run.summary?.trim() && !summarySnippet) {
        summarySnippet =
          run.summary.trim().slice(0, 160) +
          (run.summary.trim().length > 160 ? "…" : "");
      }

      const mentions = alignMentionsToBrands(
        p.target_brand,
        p.competitors,
        (run.brand_mentions ?? []).map((m) => ({
          brand_name: m.brand_name,
          count: m.mention_count,
          is_target: m.is_target,
        })),
      );
      const pct = sovPercentages(mentions).find((m) => m.is_target)?.share_pct ?? 0;
      sovSum += pct;
      sovN += 1;

      for (const s of run.sources ?? []) {
        sourceCount += 1;
        const host = hostnameFromUrl(s.url);
        if (host) {
          const cur = domainCounts.get(host) ?? { count: 0, generic: false };
          cur.count += 1;
          cur.generic = cur.generic || isGenericSourceHost(host);
          domainCounts.set(host, cur);
        }
      }
    }

    return {
      promptId: p.id,
      createdAt: p.created_at,
      promptText: p.prompt_text,
      avgTargetSovPct: sovN > 0 ? Math.round((sovSum / sovN) * 10) / 10 : 0,
      sourceCount,
      summarySnippet,
      providers,
    };
  });

  const domainAgg: DomainAgg[] = Array.from(domainCounts.entries())
    .map(([domain, v]) => ({
      domain,
      count: v.count,
      generic: v.generic,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return {
    seriesId,
    snapshots,
    domainAgg,
  };
}
