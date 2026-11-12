import type { Metadata } from "next";
import { AppSidebar, MobileNav, type Counts } from "@/components/app/app-sidebar";
import { KeyDatesPanel } from "@/components/app/key-dates-panel";
import { ReadinessReport } from "@/components/app/readiness-report";
import { StatCards } from "@/components/app/stat-cards";
import { SummaryCard } from "@/components/app/summary-card";
import { UploadDropzone } from "@/components/app/upload-dropzone";
import { FooterDisclaimer } from "@/components/footer-disclaimer";
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

  const counts: Counts = {
    pass: run.results.filter((result) => result.status === "pass").length,
    warning: run.results.filter((result) => result.status === "warning").length,
    fail: run.results.filter((result) => result.status === "fail").length,
    missing: run.results.filter((result) => result.status === "missing").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1560px]">
        <AppSidebar counts={counts} />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav counts={counts} />

          <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
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

            <div className="mt-5">
              <UploadDropzone />
            </div>

            <StatCards
              score={run.score}
              issues={counts.fail}
              missing={counts.missing}
              daysUntilDue={run.keyDates.daysUntilDueDate}
              dueDateLabel={`Due ${formatDate(run.keyDates.dueDate)}`}
            />

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-5">
                <SummaryCard summary={summary} />
                <ReadinessReport
                  results={run.results}
                  evidenceDocs={project.evidenceDocs}
                />
              </div>

              <div className="min-w-0" id="key-dates">
                <KeyDatesPanel
                  keyDates={run.keyDates}
                  paymentTerms={project.subcontract.paymentTerms}
                  submissionDate={project.currentApplication.submissionDate}
                />
              </div>
            </div>
          </main>

          <FooterDisclaimer />
        </div>
      </div>
    </div>
  );
}
