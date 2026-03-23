import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Source = { url: string; category: string; note: string | null };

type Props = {
  sources: Source[];
};

export function SourcesTable({ sources }: Props) {
  if (sources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No URLs or cited sources detected in the response.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead className="w-[140px]">Category</TableHead>
            <TableHead className="min-w-[200px]">Supports / provenance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((s) => (
            <TableRow key={`${s.url}-${s.category}-${s.note ?? ""}`}>
              <TableCell className="max-w-[380px] truncate font-mono text-xs">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {s.url}
                </a>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {s.category}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[480px] text-sm text-muted-foreground">
                {s.note?.trim() ? s.note : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
