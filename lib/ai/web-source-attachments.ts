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

/**
 * Appends a short footer so URLs appear in `full_response` for extraction and UI,
 * but only when they are not already present in the body.
 */
export function appendMissingSourceUrls(
  body: string,
  urls: string[],
  sectionTitle: string,
): string {
  const missing = urls.filter((u) => u.length > 0 && !body.includes(u));
  if (missing.length === 0) return body;
  const lines = missing.map((u) => `- ${u}`);
  return `${body}\n\n---\n\n**${sectionTitle}**\n${lines.join("\n")}`;
}
