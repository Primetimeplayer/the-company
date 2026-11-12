import { formatGBP, formatPercent } from "../money";
import type { CheckResult, Project } from "../types";
import { expectedRetentionPence, retentionCapPence } from "./shared";

/**
 * Rule 4: retention must be the subcontract rate applied to cumulative gross,
 * respecting the cap where one is set.
 */
export function retention(project: Project): CheckResult[] {
  const application = project.currentApplication;
  const grossPence = application.cumulativeGrossPence;
  const rate = project.subcontract.retentionPercent;
  const capPence = retentionCapPence(project);
  const expectedPence = expectedRetentionPence(project, grossPence);
  const capNote =
    capPence === undefined
      ? ""
      : ` Cap: ${formatPercent(project.subcontract.retentionCapPercent ?? 0)} of the subcontract value (${formatGBP(capPence)}).`;

  const base = {
    id: "retention",
    title: "Retention",
    category: "money" as const,
    sourceDocIds: [application.sourceDocId],
  };

  if (application.retentionPence === expectedPence) {
    return [
      {
        ...base,
        status: "pass",
        message: `${formatGBP(expectedPence)} retained at ${formatPercent(rate)} of ${formatGBP(grossPence)}.${capNote}`,
        expected: `${formatPercent(rate)} = ${formatGBP(expectedPence)}`,
        actual: `${formatGBP(application.retentionPence)} stated`,
      },
    ];
  }

  const actualRate =
    grossPence === 0
      ? 0
      : Math.round((application.retentionPence / grossPence) * 1000) / 10;

  return [
    {
      ...base,
      status: "fail",
      message: `Retention is stated as ${formatGBP(application.retentionPence)} (${formatPercent(actualRate)} of ${formatGBP(grossPence)}), but the subcontract rate is ${formatPercent(rate)} — ${formatGBP(expectedPence)}.${capNote}`,
      expected: `${formatPercent(rate)} = ${formatGBP(expectedPence)}`,
      actual: `${formatPercent(actualRate)} = ${formatGBP(application.retentionPence)}`,
    },
  ];
}
