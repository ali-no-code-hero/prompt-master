import { PromptForm } from "@/components/prompt-form";
import { PromptLibrary } from "@/components/prompt-library";
import { EmptyResultsPlaceholder } from "@/components/results/empty-results-placeholder";
import { RecentPromptsList } from "@/components/results/recent-prompts-list";
import type { PromptPrefill } from "@/lib/data/get-prompt-prefill";
import { getPromptPrefill } from "@/lib/data/get-prompt-prefill";
import { getPromptTemplate } from "@/lib/data/get-prompt-template";
import { getPromptTemplates } from "@/lib/data/get-templates";
import { getRecentPrompts } from "@/lib/data/get-recent-prompts";

/** Server Actions on this page call slow LLM + web search APIs; raise platform limits (e.g. Vercel). */
export const maxDuration = 300;

type SearchParams = Promise<{
  rerunFrom?: string;
  template?: string;
}>;

function templateToPrefill(t: NonNullable<Awaited<ReturnType<typeof getPromptTemplate>>>): PromptPrefill {
  return {
    promptText: t.prompt_text,
    targetBrand: t.target_brand,
    competitors: t.competitors.join(", "),
    seriesId: "",
    brandAliasesJson: "{}",
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const prefill = sp.rerunFrom
    ? await getPromptPrefill(sp.rerunFrom)
    : null;
  const templateRow = sp.template
    ? await getPromptTemplate(sp.template)
    : null;

  const initial: PromptPrefill | null =
    prefill ?? (templateRow ? templateToPrefill(templateRow) : null);

  const formKey = sp.rerunFrom ?? sp.template ?? "new";

  const recent = await getRecentPrompts();
  const templates = await getPromptTemplates();
  const hasHistory = recent.length > 0;

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
          Test prompts across OpenAI, Gemini, and Perplexity Sonar with web-grounded
          answers, measure brand visibility, and track how answers change over time
          in a series.
        </p>
      </header>

      <PromptLibrary templates={templates} />

      <PromptForm key={formKey} initial={initial} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {hasHistory ? "Recent analyses" : "Results"}
        </h2>
        {hasHistory ? (
          <RecentPromptsList prompts={recent} />
        ) : (
          <EmptyResultsPlaceholder />
        )}
      </section>
    </div>
  );
}
