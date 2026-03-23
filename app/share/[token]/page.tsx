import { notFound } from "next/navigation";

import { ResultsDashboard } from "@/components/results/results-dashboard";
import { fetchPromptResultsWithSupabase } from "@/lib/data/get-prompt-results";
import { hashShareToken } from "@/lib/share/hash-token";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

type Props = { params: Promise<{ token: string }> };

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  if (!token) {
    notFound();
  }

  let admin;
  try {
    admin = createSupabaseServiceRoleClient();
  } catch {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-sm text-muted-foreground">
        Share links require{" "}
        <code className="rounded bg-muted px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
        on the server to validate tokens.
      </div>
    );
  }

  const token_hash = hashShareToken(token);
  const { data: share, error: sErr } = await admin
    .from("share_tokens")
    .select("prompt_id, expires_at")
    .eq("token_hash", token_hash)
    .maybeSingle();

  if (sErr || !share) {
    notFound();
  }

  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    notFound();
  }

  const data = await fetchPromptResultsWithSupabase(admin, share.prompt_id);
  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6">
      <p className="text-sm text-muted-foreground">
        Shared read-only view — sign in to run new analyses.
      </p>
      <ResultsDashboard data={data} readOnly />
    </div>
  );
}
