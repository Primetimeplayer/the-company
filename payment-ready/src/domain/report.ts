import type { CheckResult, CheckStatus } from "./types";

export type ReportFilter = "all" | "issues" | "missing" | "passed";

export const REPORT_FILTERS: { value: ReportFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "issues", label: "Issues" },
  { value: "missing", label: "Missing" },
  { value: "passed", label: "Passed" },
];

const STATUS_ORDER: Record<CheckStatus, number> = {
  fail: 0,
  missing: 1,
  warning: 2,
  pass: 3,
};

/** Fail → missing → warning → pass, stable within each status. */
export function sortCheckResults(results: CheckResult[]): CheckResult[] {
  return [...results].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );
}

export function filterCheckResults(
  results: CheckResult[],
  filter: ReportFilter,
): CheckResult[] {
  switch (filter) {
    case "issues":
      return results.filter((result) => result.status === "fail");
    case "missing":
      return results.filter((result) => result.status === "missing");
    case "passed":
      return results.filter((result) => result.status === "pass");
    case "all":
    default:
      return results;
  }
}

export function countByFilter(
  results: CheckResult[],
  filter: ReportFilter,
): number {
  return filterCheckResults(results, filter).length;
}
