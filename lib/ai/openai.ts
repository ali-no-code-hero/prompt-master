import OpenAI from "openai";

import {
  DEFAULT_EXTRACTION_MODEL,
  DEFAULT_OPENAI_PRIMARY_MODEL,
} from "@/lib/ai/constants";

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
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: promptText }],
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI returned an empty response");
  }
  return text;
}

export function getExtractionModelName(): string {
  return process.env.EXTRACTION_MODEL ?? DEFAULT_EXTRACTION_MODEL;
}
