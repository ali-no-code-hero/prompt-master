import { PromptForm } from "@/components/prompt-form";
import { EmptyResultsPlaceholder } from "@/components/results/empty-results-placeholder";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          GEO / AEO analytics
        </p>
        <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
          Prompt Master
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Test prompts across OpenAI and Gemini, measure brand visibility, and
          capture how models position your brand versus competitors.
        </p>
      </header>

      <PromptForm />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Results</h2>
        <EmptyResultsPlaceholder />
      </section>
    </div>
  );
}
