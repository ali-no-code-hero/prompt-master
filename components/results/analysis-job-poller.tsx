"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type JobRow = {
  id: string;
  status: string;
  error: string | null;
  result_prompt_id: string | null;
};

type Props = {
  jobId: string;
};

export function AnalysisJobPoller({ jobId }: Props) {
  const router = useRouter();
  const [job, setJob] = useState<JobRow | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = (await res.json()) as JobRow | null;
        if (cancelled || !data) {
          return;
        }
        setJob(data);
        if (data.status === "completed" && data.result_prompt_id) {
          router.push(`/results/${data.result_prompt_id}`);
          return;
        }
        if (data.status === "failed") {
          setErr(data.error ?? "Job failed.");
          return;
        }
        if (
          data.status === "pending" ||
          data.status === "running"
        ) {
          window.setTimeout(tick, 2000);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Polling failed.");
        }
      }
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [jobId, router]);

  return (
    <div
      role="status"
      className="rounded-xl border border-border/80 bg-muted/15 px-4 py-3 text-sm"
    >
      <p className="font-medium">Background analysis</p>
      <p className="mt-1 text-muted-foreground">
        Job <code className="text-xs">{jobId}</code> —{" "}
        {job?.status ?? "starting…"}
      </p>
      {err ? <p className="mt-2 text-destructive">{err}</p> : null}
    </div>
  );
}
