import type { Tool } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { DEFAULT_GEMINI_PRIMARY_MODEL } from "@/lib/ai/constants";
import { PRIMARY_SYSTEM_INSTRUCTIONS } from "@/lib/ai/primary-system";
import {
  appendMissingSourceUrls,
  collectGeminiGroundingUrls,
} from "@/lib/ai/web-source-attachments";

export function getGeminiClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(key);
}

export async function runGeminiPrimary(promptText: string): Promise<string> {
  const genAI = getGeminiClient();
  const modelName =
    process.env.GEMINI_PRIMARY_MODEL ?? DEFAULT_GEMINI_PRIMARY_MODEL;
  // Current Gemini models require `google_search`, not legacy `google_search_retrieval`.
  // Request body is JSON.stringify'd as-is; REST expects snake_case `google_search`.
  const googleSearchGroundingTool = {
    google_search: {},
  } as Tool;

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: PRIMARY_SYSTEM_INSTRUCTIONS,
    tools: [googleSearchGroundingTool],
  });
  const result = await model.generateContent(promptText);
  const text = result.response.text();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const grounding =
    result.response.candidates?.[0]?.groundingMetadata;
  const groundingUrls = collectGeminiGroundingUrls(grounding);
  return appendMissingSourceUrls(
    text,
    groundingUrls,
    "Sources (Google Search grounding)",
  );
}
