import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ResultsNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Results not found</h1>
      <p className="text-muted-foreground">
        This prompt run does not exist or could not be loaded from the database.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
        Return home
      </Link>
    </div>
  );
}
