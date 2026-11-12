import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { buildSummary } from "../summary";
import type { CheckStatus } from "../types";
import { runAllChecks } from "./index";

function statusOf(
  results: ReturnType<typeof runAllChecks>["results"],
  id: string,
): CheckStatus | undefined {
  return results.find((result) => result.id === id)?.status;
}

describe("runAllChecks on the sample project", () => {
  const run = runAllChecks(sampleProject);
  const scored = run.results.filter((result) => !result.informational);

  it("catches every planted error", () => {
    // 1. L3 line item maths off by £450.
    expect(statusOf(run.results, "line-item-maths:L3")).toBe("fail");
    // 2. Cumulative gross does not equal line items + variations.
    expect(statusOf(run.results, "cumulative-total")).toBe("fail");
    // 3. Retention at 3% instead of 5%.
    expect(statusOf(run.results, "retention")).toBe("fail");
    // 4. Previously certified does not match application #3.
    expect(statusOf(run.results, "previously-certified")).toBe("fail");
    // Plus the planted variation, compliance and evidence issues.
    expect(statusOf(run.results, "variation-claim:V03")).toBe("fail");
    expect(statusOf(run.results, "variation-claim:V04")).toBe("fail");
    expect(statusOf(run.results, "compliance:public_liability")).toBe("fail");
    expect(statusOf(run.results, "compliance:rams")).toBe("missing");
    expect(statusOf(run.results, "evidence:photos:L5")).toBe("missing");
    // Amount due is arithmetically consistent but wrong against corrected figures.
    expect(statusOf(run.results, "amount-due")).toBe("warning");
  });

  it("scores only the checks that are not informational", () => {
    expect(run.score).toEqual({ passed: 15, total: 26 });
    expect(run.results.filter((result) => result.informational)).toHaveLength(3);

    expect(scored.filter((result) => result.status === "fail")).toHaveLength(7);
    expect(scored.filter((result) => result.status === "missing")).toHaveLength(2);
    expect(scored.filter((result) => result.status === "warning")).toHaveLength(2);
    expect(scored.filter((result) => result.status === "pass")).toHaveLength(15);
  });

  it("does not count the signed-variations summary twice", () => {
    const summaryRow = run.results.find(
      (result) => result.id === "evidence:signed-variations",
    );
    expect(summaryRow?.informational).toBe(true);
    expect(summaryRow?.status).not.toBe("fail");
    expect(run.results.filter((result) => result.status === "fail")).toHaveLength(7);
  });

  it("returns the payment timetable alongside the results", () => {
    expect(run.keyDates.dueDate).toBe("2026-02-01");
    expect(run.keyDates.finalDateForPayment).toBe("2026-03-01");
  });

  it("gives every result a message and source documents", () => {
    for (const result of run.results) {
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.sourceDocIds.length).toBeGreaterThan(0);
      expect(result.title.length).toBeGreaterThan(0);
    }
  });

  it("builds the deterministic summary from the failures", () => {
    const summary = buildSummary(run.results);
    expect(summary.headline).toBe(
      "7 issues and 2 missing items. Plus 2 warnings to review.",
    );
    expect(summary.detail).toBe(
      "Fix the retention rate and get V03 signed before submitting.",
    );
  });
});

describe("runAllChecks on the clean project", () => {
  const run = runAllChecks(cleanProject);

  it("passes every scored check", () => {
    const notPassed = run.results.filter(
      (result) => !result.informational && result.status !== "pass",
    );
    expect(notPassed).toEqual([]);
    expect(run.score).toEqual({ passed: 25, total: 25 });
  });

  it("summarises as ready to submit", () => {
    const summary = buildSummary(run.results);
    expect(summary.headline).toBe("Ready to submit — all 25 checks passed.");
    expect(summary.detail).toContain("diarise the payment notice date");
  });
});
