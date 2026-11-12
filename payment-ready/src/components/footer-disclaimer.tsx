import { cn } from "@/lib/utils";

export function FooterDisclaimer({
  className,
  bordered = true,
}: {
  className?: string;
  bordered?: boolean;
}) {
  return (
    <footer
      className={cn(
        "px-5 py-6 sm:px-8",
        bordered && "border-t border-border",
        className,
      )}
    >
      <p className="mx-auto max-w-6xl text-xs leading-relaxed text-slate-500">
        Payment Ready is a checking aid. It does not guarantee payment or provide
        legal advice. Sample data shown.
      </p>
    </footer>
  );
}
