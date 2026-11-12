import { formatGBP, percentOfPence } from "../money";
import type { CheckResult, Project } from "../types";

/**
 * Rule 1: each line item must be claimed at contract value × % complete,
 * rounded to the nearest penny. Percentages outside 0–100 are rejected.
 */
export function lineItemMaths(project: Project): CheckResult[] {
  const application = project.currentApplication;

  return application.lineItems.map((item) => {
    const base = {
      id: `line-item-maths:${item.ref}`,
      title: `${item.ref} – ${item.description}`,
      category: "money" as const,
      sourceDocIds: [application.sourceDocId],
    };

    const expected = `${formatGBP(
      percentOfPence(item.contractValuePence, item.percentComplete),
    )} (${item.percentComplete}% of ${formatGBP(item.contractValuePence)})`;
    const actual = `${formatGBP(item.claimedPence)} claimed`;

    if (item.percentComplete < 0 || item.percentComplete > 100) {
      return {
        ...base,
        status: "fail" as const,
        message: `${item.ref} – ${item.description} is recorded as ${item.percentComplete}% complete. Percentage complete must be between 0% and 100%.`,
        expected: "0% to 100% complete",
        actual: `${item.percentComplete}% complete`,
      };
    }

    const expectedPence = percentOfPence(
      item.contractValuePence,
      item.percentComplete,
    );
    const differencePence = item.claimedPence - expectedPence;

    if (differencePence === 0) {
      return {
        ...base,
        status: "pass" as const,
        message: `${formatGBP(item.claimedPence)} claimed, which matches ${item.percentComplete}% of ${formatGBP(item.contractValuePence)}.`,
        expected,
        actual,
      };
    }

    const direction = differencePence > 0 ? "over-claimed" : "under-claimed";
    return {
      ...base,
      status: "fail" as const,
      message: `Claimed ${formatGBP(item.claimedPence)}, but ${item.percentComplete}% of ${formatGBP(item.contractValuePence)} is ${formatGBP(expectedPence)} — ${formatGBP(Math.abs(differencePence))} ${direction}.`,
      expected,
      actual,
    };
  });
}
