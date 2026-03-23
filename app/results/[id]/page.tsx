import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResultsDashboard } from "@/components/results/results-dashboard";
import { getPromptResults } from "@/lib/data/get-prompt-results";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;
  const data = await getPromptResults(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 inline-flex gap-2",
          )}
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </div>

      <ResultsDashboard data={data} />
    </div>
  );
}
