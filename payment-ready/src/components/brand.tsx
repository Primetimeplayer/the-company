import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      aria-label="Payment Ready home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from to-brand-to text-white shadow-sm">
        <FileCheck2 className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-brand-ink">
        Payment Ready
      </span>
    </Link>
  );
}
