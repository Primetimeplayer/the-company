import type { Metadata } from "next";
import type { Counts } from "@/components/app/app-sidebar";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { runAllChecks } from "@/domain/checks";
import { buildSummary } from "@/domain/summary";
import { sampleProject } from "@/fixtures/sample-project";
import { formatDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Application review — Payment Ready",
  description: "Sample payment application readiness report.",
};

export default function DashboardPage() {
  const run = runAllChecks(sampleProject);
  const summary = buildSummary(run.results);
  const project = sampleProject;

  // Informational rows are reference output, not checks, so they never appear
  // in the sidebar counts — the same rule the score and summary use.
  const scored = run.results.filter((result) => !result.informational);

  const counts: Counts = {
    pass: scored.filter((result) => result.status === "pass").length,
    warning: scored.filter((result) => result.status === "warning").length,
    fail: scored.filter((result) => result.status === "fail").length,
    missing: scored.filter((result) => result.status === "missing").length,
  };

  const header = (
    <header className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="text-[12px] text-slate-500">
        <span>Applications</span>
        <span className="px-1.5 text-slate-300" aria-hidden>
          /
        </span>
        <span className="font-medium text-slate-700">
          {project.subcontract.projectRef}
        </span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[26px]">
            {project.subcontract.projectName}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
            {project.subcontract.mainContractor} →{" "}
            {project.subcontract.subcontractor} · Application #
            {project.currentApplication.number}
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800">
          {project.sampleLabel}
        </span>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardShell
        counts={counts}
        header={header}
        dashboard={{
          score: run.score,
          issues: counts.fail,
          missing: counts.missing,
          daysUntilDue: run.keyDates.daysUntilDueDate,
          dueDateLabel: `Contractual due date ${formatDate(run.keyDates.dueDate)}`,
          summary,
          results: run.results,
          evidenceDocs: project.evidenceDocs,
          keyDates: run.keyDates,
          paymentTerms: project.subcontract.paymentTerms,
          submissionDate: project.currentApplication.submissionDate,
        }}
      />
    </div>
  );
}
