import { BarChart3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyResultsPlaceholder() {
  return (
    <Card className="border-dashed border-border/80 bg-muted/10">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <BarChart3 className="size-10 text-muted-foreground" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium text-foreground">No results yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Submit a prompt above to see visibility, sentiment, share of voice,
            and cited sources from each model.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
