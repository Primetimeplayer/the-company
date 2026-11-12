import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { buildSummary } from "../summary";
import type { CheckStatus } from "../types";
import { runAllChecks } from "./index";

function statusOf(results: ReturnType<typeof runAllChecks>["results"], id: string): CheckStatus | undefined {
  return results.find((result) => result.id === id)?.status;
}

describe("runAllChecks on the sample project", () => {
  const run = runAllChecks(sampleProject);

  it("catches every planted error", () => {
    // 1. L3 line item maths off by £450.
    expect(statusOf(run.results, "line-item-maths:L3")).toBe("fail");
    // 2. Cumulative gross does not equal line items + variations.
    expect(statusOf(run.results, "cumulative-total")).toBe("fail");
    // 3. Retention at 3% instead of 5%.
    expect(statusOf(run.results, "retention")).toBe("fail");
    // 4. Previously certified does not match application #3.
    expect(statusOf(run.results, "previously-certified")).toBe("fail");
    // Plus the planted variation and compliance issues.
    expect(statusOf(run.results, "variation-claim:V03")).toBe("fail");
    expect(statusOf(run.results, "variation-claim:V04")).toBe("fail");
    expect(statusOf(run.results, "compliance:public_liability")).toBe("fail");
    expect(statusOf(run.results, "evidence:photos:L5")).toBe("missing");
  });

  it("scores the sample application", () => {
    expect(run.score.total).toBe(28);
    expect(run.score.passed).toBe(18);
    expect(run.results.filter((result) => result.status === "fail")).toHaveLength(8);
    expect(run.results.filter((result) => result.status === "missing")).toHaveLength(1);
    expect(run.results.filter((result) => result.status === "warning")).toHaveLength(1);
  });

  it("returns the payment timetable alongside the results", () => {
    expect(run.keyDates.dueDate).toBe("2026-02-09");
    expect(run.keyDates.finalDateForPayment).toBe("2026-03-09");
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
    expect(summary.headline).toBe("8 issues and 1 missing item. Plus 1 warning to review.");
    expect(summary.detail).toBe(
      "Fix the retention rate and get V03 signed before submitting.",
    );
  });
});

describe("runAllChecks on the clean project", () => {
  const run = runAllChecks(cleanProject);

  it("passes every check", () => {
    const notPassed = run.results.filter((result) => result.status !== "pass");
    expect(notPassed).toEqual([]);
    expect(run.score).toEqual({ passed: 27, total: 27 });
  });

  it("summarises as ready to submit", () => {
    const summary = buildSummary(run.results);
    expect(summary.headline).toBe("Ready to submit — all 27 checks passed.");
    expect(summary.detail).toContain("diarise the payment notice date");
  });
});
