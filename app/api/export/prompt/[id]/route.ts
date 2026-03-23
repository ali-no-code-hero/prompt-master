import { sovPercentages } from "@/lib/ai/sov";
import { getPromptResults } from "@/lib/data/get-prompt-results";

type Params = { params: Promise<{ id: string }> };

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const data = await getPromptResults(id);
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const lines: string[] = [];
  lines.push("kind,key,field,value");
  lines.push(`prompt,${data.prompt.id},text,${csvEscape(data.prompt.prompt_text)}`);
  lines.push(
    `prompt,${data.prompt.id},target_brand,${csvEscape(data.prompt.target_brand)}`,
  );
  lines.push(
    `prompt,${data.prompt.id},competitors,${csvEscape(data.prompt.competitors.join("; "))}`,
  );
  lines.push(`prompt,${data.prompt.id},series_id,${csvEscape(data.prompt.series_id)}`);

  for (const run of data.runs) {
    lines.push(
      `run,${run.id},model_name,${csvEscape(run.model_name)}`,
      `run,${run.id},provider,${csvEscape(run.provider ?? "")}`,
      `run,${run.id},api_model,${csvEscape(run.api_model ?? "")}`,
      `run,${run.id},used_web_search,${String(run.used_web_search ?? "")}`,
      `run,${run.id},created_at,${csvEscape(run.created_at)}`,
      `run,${run.id},summary,${csvEscape(run.summary ?? "")}`,
      `run,${run.id},sentiment,${csvEscape(run.sentiment ?? "")}`,
      `run,${run.id},recommendation_context,${csvEscape(run.recommendation_context ?? "")}`,
    );
    const sov = sovPercentages(run.brand_mentions);
    for (const m of sov) {
      lines.push(
        `sov,${run.id},${csvEscape(m.brand_name)},mentions,${m.mention_count}`,
        `sov,${run.id},${csvEscape(m.brand_name)},share_pct,${m.share_pct}`,
      );
    }
    for (const s of run.sources) {
      lines.push(`source,${s.id},url,${csvEscape(s.url)}`);
      lines.push(`source,${s.id},category,${csvEscape(s.category)}`);
      lines.push(`source,${s.id},note,${csvEscape(s.note ?? "")}`);
    }
  }

  const body = lines.join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prompt-${id}.csv"`,
    },
  });
}
