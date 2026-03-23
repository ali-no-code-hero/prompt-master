import { z } from "zod";

export const RECOMMENDATION_CONTEXTS = [
  "Top Recommendation",
  "Alternative",
  "Negative Warning",
  "Unmentioned",
  "Mixed",
] as const;

export const SOURCE_CATEGORIES = [
  "Owned Domain",
  "Forum/Reddit",
  "News/Media",
  "Review Site",
  "Other",
] as const;

export type RecommendationContext = (typeof RECOMMENDATION_CONTEXTS)[number];
export type SourceCategory = (typeof SOURCE_CATEGORIES)[number];

export const extractionSchema = z.object({
  summary: z.string(),
  sentiment: z.string(),
  recommendation_context: z.string(),
  mention_counts: z.array(
    z.object({
      brand_name: z.string(),
      count: z.number().int().min(0),
      is_target: z.boolean(),
    }),
  ),
  sources: z.array(
    z.object({
      url: z.string(),
      category: z.string(),
    }),
  ),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;

export function normalizeRecommendationContext(raw: string): RecommendationContext {
  const t = raw.trim();
  const hit = RECOMMENDATION_CONTEXTS.find(
    (c) => c.toLowerCase() === t.toLowerCase(),
  );
  return hit ?? "Mixed";
}

export function normalizeSourceCategory(raw: string): SourceCategory {
  const t = raw.trim();
  const hit = SOURCE_CATEGORIES.find(
    (c) => c.toLowerCase() === t.toLowerCase(),
  );
  return hit ?? "Other";
}
