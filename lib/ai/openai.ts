import OpenAI from "openai";

import {
  DEFAULT_EXTRACTION_MODEL,
  DEFAULT_OPENAI_PRIMARY_MODEL,
} from "@/lib/ai/constants";
import { PRIMARY_SYSTEM_INSTRUCTIONS } from "@/lib/ai/primary-system";
import {
  appendMissingSourceUrls,
  collectOpenAIWebSearchUrls,
} from "@/lib/ai/web-source-attachments";

export function getOpenAIClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: key });
}

export async function runOpenAIPrimary(promptText: string): Promise<string> {
  const openai = getOpenAIClient();
  const model = process.env.OPENAI_PRIMARY_MODEL ?? DEFAULT_OPENAI_PRIMARY_MODEL;
  const response = await openai.responses.create({
    model,
    instructions: PRIMARY_SYSTEM_INSTRUCTIONS,
    input: promptText,
    tools: [{ type: "web_search" }],
    include: ["web_search_call.action.sources"],
  });

  if (response.error) {
    throw new Error(
      response.error.message ?? "OpenAI returned an error on the response",
    );
  }

  const body = response.output_text?.trim();
  if (!body) {
    throw new Error("OpenAI returned an empty response");
  }

  const searchUrls = collectOpenAIWebSearchUrls(response.output);
  return appendMissingSourceUrls(
    body,
    searchUrls,
    "Sources (OpenAI web search)",
  );
}

export function getExtractionModelName(): string {
  return process.env.EXTRACTION_MODEL ?? DEFAULT_EXTRACTION_MODEL;
}
