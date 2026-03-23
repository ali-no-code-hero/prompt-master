import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  sentiment: string | null;
  recommendationContext: string | null;
};

export function MetricsCards({ sentiment, recommendationContext }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-border/80 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Brand sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold tracking-tight">
            {sentiment ?? "—"}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/80 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recommendation context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold tracking-tight">
            {recommendationContext ?? "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
