import { describe, expect, it } from "vitest";
import { buildSummary } from "./summary";
import type { CheckResult, CheckStatus } from "./types";

function result(
  id: string,
  status: CheckStatus,
  actual: string,
  informational = false,
): CheckResult {
  return {
    id,
    title: id,
    category: id.startsWith("variation") ? "variations" : "money",
    status,
    message: `${id} ${status}`,
    actual,
    sourceDocIds: ["ev-valuation"],
    informational,
  };
}

describe("buildSummary", () => {
  it("asks for a pending variation to be approved", () => {
    const summary = buildSummary([
      result("variation-claim:V04", "fail", "Pending"),
    ]);
    expect(summary.detail).toBe("Get V04 approved before submitting.");
    expect(summary.headline).toBe("1 issue and 0 missing items.");
  });

  it("asks for an approved but unsigned variation to be signed", () => {
    const summary = buildSummary([
      result("variation-claim:V03", "fail", "Approved, not signed"),
    ]);
    expect(summary.detail).toBe("Get V03 signed before submitting.");
  });

  it("ignores informational rows in the counts", () => {
    const summary = buildSummary([
      result("revised-contract-value", "pass", "", true),
      result("key-dates", "pass", "", true),
      result("retention", "fail", "£2,400.00 stated"),
    ]);

    expect(summary.issues).toBe(1);
    expect(summary.headline).toBe("1 issue and 0 missing items.");
  });

  it("reports a ready state when everything passes", () => {
    const summary = buildSummary([result("amount-due", "pass", "")]);
    expect(summary.headline).toBe("Ready to submit — all 1 checks passed.");
  });
});
