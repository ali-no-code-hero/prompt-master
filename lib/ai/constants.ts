export type ModelKind = "openai" | "gemini";

export const MODEL_LABELS: Record<ModelKind, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
};

export const DEFAULT_OPENAI_PRIMARY_MODEL = "gpt-4o-mini";
export const DEFAULT_GEMINI_PRIMARY_MODEL = "gemini-2.0-flash";
export const DEFAULT_EXTRACTION_MODEL = "gpt-4o-mini";
