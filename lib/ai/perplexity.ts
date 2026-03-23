import {
  DEFAULT_PERPLEXITY_PRIMARY_MODEL,
} from "@/lib/ai/constants";
import { PRIMARY_SYSTEM_INSTRUCTIONS } from "@/lib/ai/primary-system";
import { appendMissingSourceUrls } from "@/lib/ai/web-source-attachments";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

type PerplexityChatResponse = {
  choices?: { message?: { content?: string | null } }[];
  citations?: string[];
  search_results?: { url?: string | null }[];
  error?: { message?: string };
};

function collectPerplexitySourceUrls(data: PerplexityChatResponse): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const u of data.citations ?? []) {
    const s = typeof u === "string" ? u.trim() : "";
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }

  for (const row of data.search_results ?? []) {
    const s = typeof row.url === "string" ? row.url.trim() : "";
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }

  return out;
}

/**
 * Perplexity Sonar chat completions (OpenAI-compatible) with web search and citations.
 * @see https://docs.perplexity.ai/guides/chat-completions-guide
 */
export async function runPerplexityPrimary(promptText: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set");
  }

  const model =
    process.env.PERPLEXITY_PRIMARY_MODEL ?? DEFAULT_PERPLEXITY_PRIMARY_MODEL;

  const res = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: PRIMARY_SYSTEM_INSTRUCTIONS },
        { role: "user", content: promptText },
      ],
    }),
  });

  const raw: unknown = await res.json().catch(() => ({}));
  const data = raw as PerplexityChatResponse;

  if (!res.ok) {
    const msg =
      data.error?.message ??
      (typeof raw === "object" && raw !== null && "message" in raw
        ? String((raw as { message?: string }).message)
        : null) ??
      `Perplexity API error (${res.status})`;
    throw new Error(msg);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Perplexity returned an empty response");
  }

  const urls = collectPerplexitySourceUrls(data);
  return appendMissingSourceUrls(
    content,
    urls,
    "Sources (Perplexity Sonar)",
    "Page returned in Perplexity citations or search results for this reply; align with inline [n] citations in the Direct answer where applicable.",
  );
}
