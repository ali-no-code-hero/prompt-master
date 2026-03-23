import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOptionalUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
