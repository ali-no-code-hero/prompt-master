import Link from "next/link";

import { LoginForm } from "@/components/login-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16">
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit -ml-2")}
      >
        Back
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Magic link via Supabase Auth (configure email provider in your Supabase
          project).
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
