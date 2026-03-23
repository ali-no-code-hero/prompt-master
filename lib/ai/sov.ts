export type MentionRow = {
  brand_name: string;
  mention_count: number;
  is_target: boolean;
};

function norm(s: string): string {
  return s.toLowerCase().trim();
}

/**
 * Aligns extracted counts with the configured target + competitor list so the
 * dashboard always shows one row per tracked brand.
 */
export function alignMentionsToBrands(
  targetBrand: string,
  competitors: string[],
  extracted: { brand_name: string; count: number; is_target: boolean }[],
): MentionRow[] {
  const tracked = [
    { brand_name: targetBrand, is_target: true },
    ...competitors.map((c) => ({ brand_name: c, is_target: false })),
  ];

  return tracked.map((t) => {
    const hit = extracted.find((e) => norm(e.brand_name) === norm(t.brand_name));
    return {
      brand_name: t.brand_name,
      mention_count: hit?.count ?? 0,
      is_target: t.is_target,
    };
  });
}

export function sovPercentages(mentions: MentionRow[]): {
  brand_name: string;
  mention_count: number;
  share_pct: number;
  is_target: boolean;
}[] {
  const total = mentions.reduce((s, m) => s + m.mention_count, 0);
  if (total === 0) {
    return mentions.map((m) => ({
      brand_name: m.brand_name,
      mention_count: m.mention_count,
      share_pct: 0,
      is_target: m.is_target,
    }));
  }
  return mentions.map((m) => ({
    brand_name: m.brand_name,
    mention_count: m.mention_count,
    share_pct: Math.round((m.mention_count / total) * 1000) / 10,
    is_target: m.is_target,
  }));
}
