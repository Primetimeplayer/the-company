import { formatGBP, formatPercent } from "../money";
import type { CheckResult, Project } from "../types";
import {
  expectedRetentionPence,
  retentionCapPence,
  trueCumulativeGrossPence,
} from "./shared";

/**
 * Rule 4: retention must be the subcontract rate applied to cumulative gross,
 * respecting the cap where one is set.
 *
 * Two figures are reported: the rate applied to the cumulative gross stated in
 * the application (internal arithmetic) and the rate applied to the corrected
 * cumulative gross built from the line items and variation claims.
 */
export function retention(project: Project): CheckResult[] {
  const application = project.currentApplication;
  const rate = project.subcontract.retentionPercent;
  const capPence = retentionCapPence(project);
  const capNote =
    capPence === undefined
      ? ""
      : ` Cap: ${formatPercent(project.subcontract.retentionCapPercent ?? 0)} of the revised contract value (${formatGBP(capPence)}).`;

  const statedGrossPence = application.cumulativeGrossPence;
  const trueGrossPence = trueCumulativeGrossPence(project);
  const internalPence = expectedRetentionPence(project, statedGrossPence);
  const correctedPence = expectedRetentionPence(project, trueGrossPence);

  const expected = `${formatPercent(rate)} of corrected cumulative ${formatGBP(trueGrossPence)} = ${formatGBP(correctedPence)}`;
  const actual = `${formatGBP(application.retentionPence)} stated (${formatPercent(
    statedGrossPence === 0
      ? 0
      : Math.round((application.retentionPence / statedGrossPence) * 1000) / 10,
  )} of ${formatGBP(statedGrossPence)})`;

  const base = {
    id: "retention",
    title: "Retention",
    category: "money" as const,
    sourceDocIds: [application.sourceDocId],
  };

  if (
    application.retentionPence === internalPence &&
    application.retentionPence === correctedPence
  ) {
    return [
      {
        ...base,
        status: "pass",
        message: `${formatGBP(correctedPence)} retained at ${formatPercent(rate)} of the corrected cumulative gross of ${formatGBP(trueGrossPence)}.${capNote}`,
        expected,
        actual,
      },
    ];
  }

  const differencePence = correctedPence - application.retentionPence;

  return [
    {
      ...base,
      status: "fail",
      message: `Retention is stated as ${actual.replace(" stated", "")}, but the subcontract rate is ${formatPercent(rate)}. On the corrected cumulative gross of ${formatGBP(trueGrossPence)} it should be ${formatGBP(correctedPence)} — ${formatGBP(Math.abs(differencePence))} ${differencePence >= 0 ? "more" : "less"} than stated.${capNote}`,
      expected,
      actual,
    },
  ];
}
