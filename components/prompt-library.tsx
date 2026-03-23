import Link from "next/link";

import { deleteTemplateFormAction } from "@/app/actions/templates";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplateRow } from "@/lib/data/get-templates";

type Props = {
  templates: TemplateRow[];
};

export function PromptLibrary({ templates }: Props) {
  if (templates.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/80 bg-card/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Prompt library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="space-y-2">
          {templates.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <span className="font-medium">{t.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {t.intent}
                </span>
                <p className="truncate text-xs text-muted-foreground">
                  {t.target_brand} · {t.prompt_text.slice(0, 80)}
                  {t.prompt_text.length > 80 ? "…" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Link
                  href={`/?template=${t.id}`}
                  className={cn(
                    buttonVariants({ size: "sm", variant: "secondary" }),
                  )}
                >
                  Use
                </Link>
                <form action={deleteTemplateFormAction}>
                  <input type="hidden" name="templateId" value={t.id} />
                  <Button type="submit" size="sm" variant="ghost">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
