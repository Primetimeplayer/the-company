import { formatGBP } from "../money";
import type { CheckResult, Project } from "../types";
import {
  expectedRetentionPence,
  lastPreviousApplication,
  trueCumulativeGrossPence,
} from "./shared";

/**
 * Rule 6: amount due = cumulative gross − retention − previously certified.
 *
 * The internal arithmetic of the application is checked first. The figures are
 * then recalculated from the corrected cumulative gross, corrected retention and
 * the last certified amount; a difference is reported as a warning because it
 * usually means an upstream figure is wrong rather than a bad subtraction.
 */
export function amountDue(project: Project): CheckResult[] {
  const application = project.currentApplication;
  const base = {
    id: "amount-due",
    title: "Amount due this application",
    category: "money" as const,
    sourceDocIds: [application.sourceDocId, "ev-prev-app"],
  };

  const internalPence =
    application.cumulativeGrossPence -
    application.retentionPence -
    application.previouslyCertifiedPence;

  const previous = lastPreviousApplication(project);
  const trueGrossPence = trueCumulativeGrossPence(project);
  const correctedRetentionPence = expectedRetentionPence(project, trueGrossPence);
  const certifiedPence = previous?.certifiedPence ?? application.previouslyCertifiedPence;
  const correctedPence = trueGrossPence - correctedRetentionPence - certifiedPence;

  const correctedWorking = `${formatGBP(trueGrossPence)} − ${formatGBP(correctedRetentionPence)} − ${formatGBP(certifiedPence)} = ${formatGBP(correctedPence)}`;

  if (application.amountDuePence !== internalPence) {
    return [
      {
        ...base,
        status: "fail",
        message: `Amount due does not follow from the figures in the application: ${formatGBP(application.cumulativeGrossPence)} − ${formatGBP(application.retentionPence)} − ${formatGBP(application.previouslyCertifiedPence)} = ${formatGBP(internalPence)}, but the application states ${formatGBP(application.amountDuePence)}. The corrected figures give ${correctedWorking}.`,
        expected: `${formatGBP(internalPence)} from the stated figures; ${formatGBP(correctedPence)} corrected`,
        actual: formatGBP(application.amountDuePence),
      },
    ];
  }

  if (application.amountDuePence !== correctedPence) {
    const differencePence = correctedPence - application.amountDuePence;
    return [
      {
        ...base,
        status: "warning",
        message: `The stated amount due of ${formatGBP(application.amountDuePence)} is consistent with the figures entered, but the corrected cumulative gross and certified total give ${correctedWorking}. That is ${formatGBP(Math.abs(differencePence))} ${differencePence > 0 ? "more" : "less"} than stated — reconcile the valuation before submitting.`,
        expected: `${formatGBP(correctedPence)} corrected (${correctedWorking})`,
        actual: `${formatGBP(application.amountDuePence)} stated`,
      },
    ];
  }

  return [
    {
      ...base,
      status: "pass",
      message: `Amount due is ${formatGBP(correctedPence)}, which is the corrected cumulative gross less retention and amounts previously certified.`,
      expected: correctedWorking,
      actual: formatGBP(application.amountDuePence),
    },
  ];
}
