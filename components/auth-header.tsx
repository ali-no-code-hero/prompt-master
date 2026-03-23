import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function AuthHeader() {
  let user: { id: string } | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
  } catch {
    /* Missing env or cookies during prerender — skip auth UI. */
  }

  return (
    <header className="border-b border-border/60 bg-background/80 print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Home
        </Link>
        {user ? (
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        ) : (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
