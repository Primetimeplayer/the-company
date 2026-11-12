import { Sparkles } from "lucide-react";
import type { CheckSummary } from "@/domain/summary";

export function SummaryCard({ summary }: { summary: CheckSummary }) {
  return (
    <section
      aria-labelledby="summary-heading"
      className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 p-5 shadow-card sm:p-6"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]"
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-from to-brand-to text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <h2
            id="summary-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-indigo"
          >
            Recommended next steps
          </h2>
        </div>

        <p className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">
          {summary.headline}
        </p>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-600">
          {summary.detail}
        </p>
        <p className="mt-3 text-[11px] text-slate-500">
          Generated from the checks below — no AI model is used.
        </p>
      </div>
    </section>
  );
}
