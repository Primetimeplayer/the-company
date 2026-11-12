import { formatGBP, percentOfPence } from "../money";
import type { CheckResult, Project } from "../types";

/**
 * Rule 1: each line item must be claimed at contract value × % complete,
 * rounded to the nearest penny.
 */
export function lineItemMaths(project: Project): CheckResult[] {
  const application = project.currentApplication;

  return application.lineItems.map((item) => {
    const expectedPence = percentOfPence(
      item.contractValuePence,
      item.percentComplete,
    );
    const differencePence = item.claimedPence - expectedPence;
    const base = {
      id: `line-item-maths:${item.ref}`,
      title: `${item.ref} – ${item.description}`,
      category: "money" as const,
      sourceDocIds: [application.sourceDocId],
    };

    const expected = `${formatGBP(expectedPence)} (${item.percentComplete}% of ${formatGBP(item.contractValuePence)})`;

    if (differencePence === 0) {
      return {
        ...base,
        status: "pass" as const,
        message: `${formatGBP(item.claimedPence)} claimed, which matches ${item.percentComplete}% of ${formatGBP(item.contractValuePence)}.`,
        expected,
        actual: `${formatGBP(item.claimedPence)} claimed`,
      };
    }

    const direction = differencePence > 0 ? "over-claimed" : "under-claimed";
    return {
      ...base,
      status: "fail" as const,
      message: `Claimed ${formatGBP(item.claimedPence)}, but ${item.percentComplete}% of ${formatGBP(item.contractValuePence)} is ${formatGBP(expectedPence)} — ${formatGBP(Math.abs(differencePence))} ${direction}.`,
      expected,
      actual: `${formatGBP(item.claimedPence)} claimed`,
    };
  });
}
