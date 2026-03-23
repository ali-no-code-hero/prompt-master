function norm(s: string): string {
  return s.toLowerCase().trim();
}

/**
 * Splits comma-separated competitors, trims, dedupes case-insensitively, drops empties.
 */
export function parseCompetitorsList(raw: string): string[] {
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const k = norm(p);
    if (seen.has(k)) {
      continue;
    }
    seen.add(k);
    out.push(p);
  }
  return out;
}

/**
 * True if any competitor normalized string appears as a substring of the target (likely accidental).
 */
export function competitorSubstringOfTargetWarning(
  targetBrand: string,
  competitors: string[],
): boolean {
  const t = norm(targetBrand);
  if (!t) {
    return false;
  }
  return competitors.some((c) => {
    const n = norm(c);
    return n.length > 0 && t.includes(n) && n !== t;
  });
}
