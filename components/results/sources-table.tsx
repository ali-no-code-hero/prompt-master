import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Source = { url: string; category: string };

type Props = {
  sources: Source[];
};

export function SourcesTable({ sources }: Props) {
  if (sources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No URLs or sources detected in the response.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead className="w-[160px]">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((s) => (
            <TableRow key={`${s.url}-${s.category}`}>
              <TableCell className="max-w-[420px] truncate font-mono text-xs">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
