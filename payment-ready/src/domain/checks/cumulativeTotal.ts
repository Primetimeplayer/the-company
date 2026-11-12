import { formatGBP, sumPence } from "../money";
import type { CheckResult, Project } from "../types";
import {
  sumLineItemsClaimedPence,
  sumVariationsClaimedPence,
  trueCumulativeGrossPence,
} from "./shared";

/** Rule 3: cumulative gross = line item claims + variation claims. */
export function cumulativeTotal(project: Project): CheckResult[] {
  const application = project.currentApplication;
  const lineItemsPence = sumLineItemsClaimedPence(project);
  const variationsPence = sumVariationsClaimedPence(project);
  const expectedPence = trueCumulativeGrossPence(project);
  const differencePence = application.cumulativeGrossPence - expectedPence;

  if (differencePence === 0) {
    return [
      {
        id: "cumulative-total",
        title: "Cumulative gross valuation",
        category: "money",
        status: "pass",
        message: `${formatGBP(lineItemsPence)} of line items plus ${formatGBP(variationsPence)} of variation claims equals the stated cumulative gross of ${formatGBP(expectedPence)}.`,
        expected: formatGBP(expectedPence),
        actual: formatGBP(application.cumulativeGrossPence),
        sourceDocIds: [application.sourceDocId],
      },
    ];
  }

  return [
    {
      id: "cumulative-total",
      title: "Cumulative gross valuation",
      category: "money",
      status: "fail",
      message: `Line items total ${formatGBP(lineItemsPence)} and variation claims total ${formatGBP(variationsPence)}, so cumulative gross should be ${formatGBP(expectedPence)}. The application states ${formatGBP(application.cumulativeGrossPence)} — ${formatGBP(Math.abs(differencePence))} ${differencePence > 0 ? "too high" : "too low"}.`,
      expected: `${formatGBP(expectedPence)} (${formatGBP(lineItemsPence)} line items + ${formatGBP(variationsPence)} variations)`,
      actual: formatGBP(application.cumulativeGrossPence),
      sourceDocIds: [application.sourceDocId],
    },
  ];
}
