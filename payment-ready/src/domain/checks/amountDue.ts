import { formatGBP } from "../money";
import type { CheckResult, Project } from "../types";

/** Rule 6: amount due = cumulative gross − retention − previously certified. */
export function amountDue(project: Project): CheckResult[] {
  const application = project.currentApplication;
  const expectedPence =
    application.cumulativeGrossPence -
    application.retentionPence -
    application.previouslyCertifiedPence;

  const expected = `${formatGBP(application.cumulativeGrossPence)} − ${formatGBP(application.retentionPence)} − ${formatGBP(application.previouslyCertifiedPence)} = ${formatGBP(expectedPence)}`;

  if (expectedPence === application.amountDuePence) {
    return [
      {
        id: "amount-due",
        title: "Amount due this application",
        category: "money",
        status: "pass",
        message: `Amount due is ${formatGBP(expectedPence)}, which is cumulative gross less retention and amounts previously certified.`,
        expected,
        actual: formatGBP(application.amountDuePence),
        sourceDocIds: [application.sourceDocId],
      },
    ];
  }

  return [
    {
      id: "amount-due",
      title: "Amount due this application",
      category: "money",
      status: "fail",
      message: `Amount due should be ${formatGBP(expectedPence)} but the application states ${formatGBP(application.amountDuePence)} — a ${formatGBP(Math.abs(application.amountDuePence - expectedPence))} difference.`,
      expected,
      actual: formatGBP(application.amountDuePence),
      sourceDocIds: [application.sourceDocId],
    },
  ];
}
