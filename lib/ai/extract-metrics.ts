import { GoogleGenerativeAI } from "@google/generative-ai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  type ExtractionResult,
  extractionSchema,
} from "@/lib/ai/schema";
import { getExtractionModelName, getOpenAIClient } from "@/lib/ai/openai";

const EXTRACTION_SYSTEM = `You are an AEO/GEO analyst. Given the user's original prompt, target brand, competitor brands, and a model's full answer, produce structured metrics.
- Count brand mentions in the answer (case-insensitive whole-word style matches are fine).
- Classify recommendation_context from how the target brand is positioned in the answer.
- Sentiment should describe the target brand only (e.g. positive, neutral, negative, mixed).
- Extract every https:// or http:// URL from the answer (including inside markdown links like [label](url)). Deduplicate by URL.
- For each URL, set category to the best label: Owned Domain, Forum/Reddit, News/Media, Review Site, or Other.
- For each URL, set note to a short sentence: what claim, bullet, or section of the answer that URL is meant to support. Use the model's "Supports:" text from its References section when present; otherwise infer from context. If the URL is only generic background, say so.
- If no URLs, return an empty sources array.`;

function buildUserContent(input: {
  promptText: string;
  targetBrand: string;
  competitors: string[];
  fullResponse: string;
}): string {
  return [
    `Original prompt:\n${input.promptText}`,
    `Target brand: ${input.targetBrand}`,
    `Competitor brands: ${input.competitors.length ? input.competitors.join(", ") : "(none)"}`,
    `Model response to analyze:\n---\n${input.fullResponse}\n---`,
  ].join("\n\n");
}

async function extractWithOpenAI(
  input: Parameters<typeof buildUserContent>[0],
): Promise<ExtractionResult> {
  const openai = getOpenAIClient();
  const model = getExtractionModelName();
  const completion = await openai.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM },
      {
        role: "user",
        content: buildUserContent(input),
      },
    ],
    response_format: zodResponseFormat(extractionSchema, "aeo_metrics"),
  });

  const parsed = completion.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error("Structured extraction failed (OpenAI)");
  }
  return parsed;
}

async function extractWithGemini(
  input: Parameters<typeof buildUserContent>[0],
): Promise<ExtractionResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_PRIMARY_MODEL ?? "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `${EXTRACTION_SYSTEM}\n\n${buildUserContent(input)}\n\nRespond with JSON only matching the schema with keys: summary, sentiment, recommendation_context, mention_counts, sources. Each item in sources may include url, category, and optional note.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) {
    throw new Error("Gemini extraction returned empty output");
  }

  const raw: unknown = JSON.parse(text);
  return extractionSchema.parse(raw);
}

export async function extractMetrics(input: {
  promptText: string;
  targetBrand: string;
  competitors: string[];
  fullResponse: string;
}): Promise<ExtractionResult> {
  if (process.env.OPENAI_API_KEY) {
    return extractWithOpenAI(input);
  }
  return extractWithGemini(input);
}
