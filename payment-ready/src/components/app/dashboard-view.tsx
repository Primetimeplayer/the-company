"use client";

import { useState } from "react";
import { FileSearch } from "lucide-react";
import { KeyDatesPanel } from "./key-dates-panel";
import { ReadinessReport } from "./readiness-report";
import { StatCards } from "./stat-cards";
import { SummaryCard } from "./summary-card";
import { UploadDropzone } from "./upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CheckSummary } from "@/domain/summary";
import type {
  CheckResult,
  CheckScore,
  EvidenceDoc,
  KeyDates,
  PaymentTerms,
} from "@/domain/types";

export interface DashboardViewProps {
  score: CheckScore;
  issues: number;
  missing: number;
  daysUntilDue: number;
  dueDateLabel: string;
  summary: CheckSummary;
  results: CheckResult[];
  evidenceDocs: EvidenceDoc[];
  keyDates: KeyDates;
  paymentTerms: PaymentTerms;
  submissionDate: string;
}

export function DashboardView(props: DashboardViewProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div className="mt-5">
        <UploadDropzone onSampleLoaded={() => setLoaded(true)} />
      </div>

      {loaded ? (
        <>
          <StatCards
            score={props.score}
            issues={props.issues}
            missing={props.missing}
            daysUntilDue={props.daysUntilDue}
            dueDateLabel={props.dueDateLabel}
          />

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-5">
              <SummaryCard summary={props.summary} />
              <ReadinessReport
                results={props.results}
                evidenceDocs={props.evidenceDocs}
              />
            </div>

            <div className="min-w-0" id="key-dates">
              <KeyDatesPanel
                keyDates={props.keyDates}
                paymentTerms={props.paymentTerms}
                submissionDate={props.submissionDate}
              />
            </div>
          </div>
        </>
      ) : (
        <Card className="mt-5 border-dashed p-10 text-center">
          <div className="mx-auto flex max-w-sm flex-col items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-brand-indigo">
              <FileSearch className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-[15px] font-semibold text-slate-900">
              No application loaded yet
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
              Load the sample project to see the readiness report, the checks that
              fail and the contractual payment dates.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-5"
              onClick={() => setLoaded(true)}
            >
              Load sample project
            </Button>
            <p className="mt-3 text-[11px] text-slate-500">
              Sample data only — nothing is uploaded or stored.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
