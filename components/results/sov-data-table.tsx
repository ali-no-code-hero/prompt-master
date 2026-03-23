import { sovPercentages } from "@/lib/ai/sov";

type Mention = {
  brand_name: string;
  mention_count: number;
  is_target: boolean;
};

type Props = {
  mentions: Mention[];
  caption?: string;
};

export function SovDataTable({ mentions, caption }: Props) {
  const breakdown = sovPercentages(mentions);
  const total = breakdown.reduce((s, m) => s + m.mention_count, 0);

  return (
    <div className="rounded-xl border border-border/80 overflow-x-auto">
      <table className="w-full min-w-[280px] text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border/80 bg-muted/20 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-3 py-2">
              Brand
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              Mentions
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((m) => (
            <tr
              key={m.brand_name}
              className="border-b border-border/60 last:border-0"
            >
              <th scope="row" className="px-3 py-2 font-medium">
                {m.brand_name}
                {m.is_target ? (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    (target)
                  </span>
                ) : null}
              </th>
              <td className="px-3 py-2 text-right tabular-nums">
                {m.mention_count}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {total === 0 ? "0%" : `${m.share_pct}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
