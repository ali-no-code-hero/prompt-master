"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  checkSourceUrlAction,
  type CheckUrlState,
} from "@/app/actions/check-source-url";
import {
  updateSourceNoteAction,
  type UpdateSourceNoteState,
} from "@/app/actions/update-source-note";
import { isGenericSourceHost } from "@/lib/citation/generic-domains";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type SourceRow = {
  id: string;
  url: string;
  category: string;
  note: string | null;
  http_status: number | null;
  checked_at: string | null;
};

type Props = {
  sources: SourceRow[];
  readOnly?: boolean;
};

function normalizeUrlKey(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.href.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function CheckUrlButton({
  sourceId,
  url,
}: {
  sourceId: string;
  url: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    CheckUrlState | null,
    FormData
  >(checkSourceUrlAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="sourceId" value={sourceId} />
      <input type="hidden" name="url" value={url} />
      <Button type="submit" size="sm" variant="ghost" className="h-7 text-xs" disabled={pending}>
        {pending ? "Checking…" : "Check link"}
      </Button>
      {state && !state.ok ? (
        <span className="ml-2 text-xs text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}

function SourceNoteEditor({
  sourceId,
  initialNote,
}: {
  sourceId: string;
  initialNote: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    UpdateSourceNoteState | null,
    FormData
  >(updateSourceNoteAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="sourceId" value={sourceId} />
      <Input
        name="note"
        defaultValue={initialNote ?? ""}
        placeholder="Analyst note…"
        className="h-8 text-xs"
        aria-label="Source note"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Save
      </Button>
      {state && !state.ok ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}

export function SourcesTable({ sources, readOnly = false }: Props) {
  const [dedupe, setDedupe] = useState(false);

  const keys = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sources) {
      const k = normalizeUrlKey(s.url);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [sources]);

  const rows = useMemo(() => {
    if (!dedupe) {
      return sources.map((s) => ({ s, dup: (keys.get(normalizeUrlKey(s.url)) ?? 0) > 1 }));
    }
    const seen = new Set<string>();
    return sources
      .filter((s) => {
        const k = normalizeUrlKey(s.url);
        if (seen.has(k)) {
          return false;
        }
        seen.add(k);
        return true;
      })
      .map((s) => ({ s, dup: (keys.get(normalizeUrlKey(s.url)) ?? 0) > 1 }));
  }, [sources, dedupe, keys]);

  if (sources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No URLs or cited sources detected in the response.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={dedupe}
          onChange={(e) => setDedupe(e.target.checked)}
          className="size-4 rounded border border-input accent-primary"
        />
        Show deduplicated URLs only
      </label>
      <div className="rounded-xl border border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="min-w-[200px]">Flags</TableHead>
              <TableHead className="min-w-[220px]">Supports / note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ s, dup }) => {
              const host = hostname(s.url);
              const generic = host ? isGenericSourceHost(host) : false;
              return (
                <TableRow key={s.id}>
                  <TableCell className="max-w-[380px] font-mono text-xs">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-primary underline-offset-4 hover:underline"
                    >
                      {s.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {s.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-1">
                      {dup ? (
                        <Badge variant="outline" className="text-[10px]">
                          Duplicate URL
                        </Badge>
                      ) : null}
                      {generic ? (
                        <Badge variant="outline" className="text-[10px]">
                          Generic domain
                        </Badge>
                      ) : null}
                      {s.http_status != null ? (
                        <Badge variant="outline" className="text-[10px]">
                          HTTP {s.http_status}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[480px] align-top text-sm">
                    {s.note?.trim() ? (
                      <p className="text-muted-foreground">{s.note}</p>
                    ) : (
                      <p className="text-muted-foreground">—</p>
                    )}
                    {readOnly ? null : (
                      <div className="mt-2 space-y-2">
                        <CheckUrlButton sourceId={s.id} url={s.url} />
                        <SourceNoteEditor sourceId={s.id} initialNote={s.note} />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
