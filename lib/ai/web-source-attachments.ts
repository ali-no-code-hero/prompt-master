import type { GroundingMetadata } from "@google/generative-ai";
import type { ResponseOutputItem } from "openai/resources/responses/responses";

/**
 * URLs returned by OpenAI web search tool calls (requires
 * `include: ['web_search_call.action.sources']` on the Responses request).
 */
export function collectOpenAIWebSearchUrls(
  output: ResponseOutputItem[],
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const item of output) {
    if (item.type !== "web_search_call") continue;
    if (item.status !== "completed") continue;
    const { action } = item;
    if (action.type !== "search") continue;
    for (const s of action.sources ?? []) {
      if (s.type === "url" && s.url && !seen.has(s.url)) {
        seen.add(s.url);
        urls.push(s.url);
      }
    }
  }
  return urls;
}

export function collectGeminiGroundingUrls(
  metadata: GroundingMetadata | undefined,
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const chunk of metadata?.groundingChunks ?? []) {
    const uri = chunk.web?.uri;
    if (uri && !seen.has(uri)) {
      seen.add(uri);
      urls.push(uri);
    }
  }
  return urls;
}

/** Opaque URLs returned in {@link GroundingChunkWeb.uri} for Google Search grounding. */
const VERTEX_GROUNDING_REDIRECT_PREFIX =
  "https://vertexaisearch.cloud.google.com/grounding-api-redirect/";

/**
 * Follows the one-hop 302 from Vertex grounding to the real publisher URL.
 * The API does not expose canonical URLs in metadata; only this redirect stub.
 */
export async function resolveVertexGroundingRedirectUrl(
  redirectUrl: string,
): Promise<string | null> {
  if (!redirectUrl.startsWith(VERTEX_GROUNDING_REDIRECT_PREFIX)) {
    return null;
  }
  const timeoutMs = 8_000;
  const tryOnce = async (method: "HEAD" | "GET") => {
    const res = await fetch(redirectUrl, {
      method,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (loc) {
        return new URL(loc, redirectUrl).href;
      }
    }
    return null;
  };
  try {
    const fromHead = await tryOnce("HEAD");
    if (fromHead) return fromHead;
    return await tryOnce("GET");
  } catch {
    // network / timeout — caller keeps opaque URL
  }
  return null;
}

/**
 * Replaces Vertex `grounding-api-redirect/...` URLs with resolved publisher URLs
 * (same order, deduped).
 */
export async function resolveGeminiGroundingUrls(
  urls: string[],
): Promise<string[]> {
  const expanded = await Promise.all(
    urls.map(async (u) => {
      if (!u.startsWith(VERTEX_GROUNDING_REDIRECT_PREFIX)) return u;
      const resolved = await resolveVertexGroundingRedirectUrl(u);
      return resolved ?? u;
    }),
  );
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of expanded) {
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  return out;
}

/**
 * Appends a short footer so URLs appear in `full_response` for extraction and UI,
 * but only when they are not already present in the body.
 * @param supportsHint — one sentence per appended URL so provenance extraction has text to store in `note`.
 */
export function appendMissingSourceUrls(
  body: string,
  urls: string[],
  sectionTitle: string,
  supportsHint?: string,
): string {
  const missing = urls.filter((u) => u.length > 0 && !body.includes(u));
  if (missing.length === 0) return body;
  const hint =
    supportsHint ??
    "Retrieved for this answer; align with the Direct answer and “How this answer was sourced” sections.";
  const lines = missing.map(
    (u) => `- ${u} — **Supports:** ${hint}`,
  );
  return `${body}\n\n---\n\n**${sectionTitle}**\n${lines.join("\n")}`;
}
