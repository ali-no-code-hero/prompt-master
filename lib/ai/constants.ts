export type ModelKind = "openai" | "gemini";

export const MODEL_LABELS: Record<ModelKind, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
};

/** Default for Responses API + web search (Chat Completions are not used for primary). */
export const DEFAULT_OPENAI_PRIMARY_MODEL = "gpt-4o";
export const DEFAULT_GEMINI_PRIMARY_MODEL = "gemini-2.5-flash";
export const DEFAULT_EXTRACTION_MODEL = "gpt-4o-mini";
