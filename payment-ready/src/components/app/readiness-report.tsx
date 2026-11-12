"use client";

import { useMemo, useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { StatusChip } from "@/components/status-chip";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  REPORT_FILTERS,
  countByFilter,
  filterCheckResults,
  sortCheckResults,
  type ReportFilter,
} from "@/domain/report";
import type {
  CheckCategory,
  CheckResult,
  EvidenceDoc,
} from "@/domain/types";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<CheckCategory, string> = {
  money: "Money",
  variations: "Variations",
  compliance: "Compliance",
  evidence: "Evidence",
  deadlines: "Deadlines",
};

export function ReadinessReport({
  results,
  evidenceDocs,
}: {
  results: CheckResult[];
  evidenceDocs: EvidenceDoc[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportFilter>("all");

  const selected = useMemo(
    () => results.find((result) => result.id === openId) ?? null,
    [results, openId],
  );

  const docNames = useMemo(
    () => new Map(evidenceDocs.map((doc) => [doc.id, doc.fileName])),
    [evidenceDocs],
  );

  const sorted = useMemo(() => sortCheckResults(results), [results]);
  const visible = useMemo(
    () => filterCheckResults(sorted, filter),
    [sorted, filter],
  );

  return (
    <Card className="overflow-hidden" id="report">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Readiness report</CardTitle>
          <span className="text-[11.5px] text-slate-500">
            {results.length} checks run
          </span>
        </div>
        <CardDescription>
          Every check is run against the contract terms and Northgate&apos;s
          requirements. Click a row for expected vs actual.
        </CardDescription>

        <div
          role="group"
          aria-label="Filter checks"
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {REPORT_FILTERS.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11.5px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  active
                    ? "border-brand-indigo bg-brand-indigo text-white"
                    : "border-border bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "ml-1.5 tabular-nums",
                    active ? "text-white/70" : "text-slate-400",
                  )}
                >
                  {countByFilter(results, option.value)}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      {/* Desktop table */}
      <div className="hidden border-t border-border md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[26%] min-w-[200px]">Check</TableHead>
              <TableHead className="w-[12%]">Category</TableHead>
              <TableHead className="w-[13%]">Status</TableHead>
              <TableHead className="w-[44%]">Detail</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Open</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((result) => (
              <TableRow
                key={result.id}
                className="cursor-pointer"
                onClick={() => setOpenId(result.id)}
              >
                <TableCell className="min-w-[200px] font-medium text-slate-900">
                  {result.title}
                </TableCell>
                <TableCell>
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {CATEGORY_LABELS[result.category]}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusChip status={result.status} />
                </TableCell>
                <TableCell className="text-slate-600">
                  <span className="line-clamp-2">{result.message}</span>
                </TableCell>
                <TableCell className="pr-3 text-right">
                  <button
                    type="button"
                    aria-label={`View details for ${result.title}`}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenId(result.id);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {visible.length === 0 && (
          <p className="px-4 py-6 text-center text-[12.5px] text-slate-500">
            No checks in this view.
          </p>
        )}
      </div>

      {/* Mobile list */}
      <ul className="divide-y divide-border border-t border-border md:hidden">
        {visible.map((result) => (
          <li key={result.id}>
            <button
              type="button"
              onClick={() => setOpenId(result.id)}
              className="flex w-full flex-col gap-2 px-4 py-3.5 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[13px] font-medium leading-snug text-slate-900">
                  {result.title}
                </span>
                <StatusChip status={result.status} className="shrink-0" />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                {CATEGORY_LABELS[result.category]}
              </span>
              <span className="line-clamp-2 text-[12px] leading-relaxed text-slate-600">
                {result.message}
              </span>
            </button>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="px-4 py-6 text-center text-[12.5px] text-slate-500">
            No checks in this view.
          </li>
        )}
      </ul>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setOpenId(null);
        }}
      >
        <SheetContent>
          {selected && (
            <>
              <SheetHeader className="border-b border-border px-6 py-6 pr-14">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {CATEGORY_LABELS[selected.category]}
                </p>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  <StatusChip status={selected.status} />
                  {selected.status === "pass"
                    ? "This check passed."
                    : "Review the detail below before submitting."}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <p className="rounded-xl border border-border bg-slate-50 p-4 text-[13px] leading-relaxed text-slate-700">
                  {selected.message}
                </p>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <dt className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Expected
                    </dt>
                    <dd className="mt-1.5 text-[13px] leading-relaxed text-slate-800">
                      {selected.expected ?? "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <dt className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Actual
                    </dt>
                    <dd className="mt-1.5 text-[13px] leading-relaxed text-slate-800">
                      {selected.actual ?? "—"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Source documents
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {selected.sourceDocIds.map((docId) => (
                      <li
                        key={docId}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12.5px] text-slate-700"
                      >
                        <FileText
                          className="h-3.5 w-3.5 shrink-0 text-slate-400"
                          aria-hidden
                        />
                        {docNames.get(docId) ?? docId}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-8 border-t border-border pt-4 text-[11px] leading-relaxed text-slate-500">
                  Payment Ready is a checking aid. It does not guarantee payment or
                  provide legal advice. Sample data shown.
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
