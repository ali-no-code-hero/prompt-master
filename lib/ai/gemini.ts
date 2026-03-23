import { GoogleGenerativeAI } from "@google/generative-ai";

import { DEFAULT_GEMINI_PRIMARY_MODEL } from "@/lib/ai/constants";

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
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(promptText);
  const text = result.response.text();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}
