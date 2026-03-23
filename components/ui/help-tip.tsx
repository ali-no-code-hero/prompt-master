import { Info } from "lucide-react";

type Props = {
  label: string;
  children: React.ReactNode;
};

/**
 * Hover/focus-visible explainer for dense analytics labels.
 */
export function HelpTip({ label, children }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{children}</span>
      <span className="group relative inline-flex">
        <button
          type="button"
          className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={label}
        >
          <Info className="size-3.5 shrink-0" aria-hidden />
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 hidden w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-2 text-xs leading-snug text-popover-foreground shadow-md group-hover:block group-focus-within:block"
        >
          {label}
        </span>
      </span>
    </span>
  );
}
