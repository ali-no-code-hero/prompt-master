/**
 * Extension point for Anthropic: wire `runClaudePrimary` in `run-primary.ts` once
 * you add `ANTHROPIC_API_KEY` and a supported web-grounded model path.
 * Keeping this stub documents the intended adapter shape without new env requirements.
 */
export async function runClaudePrimaryStub(promptText: string): Promise<string> {
  void promptText;
  throw new Error(
    "Claude primary is not configured. Set ANTHROPIC_API_KEY and implement runClaudePrimary in lib/ai/claude.ts when you add this surface.",
  );
}
