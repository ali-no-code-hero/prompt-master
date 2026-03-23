export type ModelKind = "openai" | "gemini" | "perplexity";

export const MODEL_LABELS: Record<ModelKind, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  perplexity: "Perplexity Sonar",
};

/** All selectable primary models (order = “run all” order). */
export const MODEL_KINDS: ModelKind[] = ["openai", "gemini", "perplexity"];

/** Default for Responses API + web search (Chat Completions are not used for primary). */
export const DEFAULT_OPENAI_PRIMARY_MODEL = "gpt-4o";
export const DEFAULT_GEMINI_PRIMARY_MODEL = "gemini-2.5-flash";
/** Sonar models use live web search + citations; see Perplexity API docs. */
export const DEFAULT_PERPLEXITY_PRIMARY_MODEL = "sonar";

export const DEFAULT_EXTRACTION_MODEL = "gpt-4o-mini";
