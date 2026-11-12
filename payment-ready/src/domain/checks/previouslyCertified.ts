import { formatGBP } from "../money";
import type { CheckResult, Project } from "../types";
import { lastPreviousApplication } from "./shared";

/**
 * Rule 5: previously certified must match the last previous application's
 * certified figure.
 */
export function previouslyCertified(project: Project): CheckResult[] {
  const application = project.currentApplication;
  const previous = lastPreviousApplication(project);
  const base = {
    id: "previously-certified",
    title: "Previously certified",
    category: "money" as const,
    sourceDocIds: [application.sourceDocId, "ev-prev-app"],
  };

  if (!previous) {
    return [
      {
        ...base,
        status: "warning",
        message: "No previous applications are on file, so previously certified cannot be verified.",
        actual: formatGBP(application.previouslyCertifiedPence),
      },
    ];
  }

  if (previous.certifiedPence === application.previouslyCertifiedPence) {
    return [
      {
        ...base,
        status: "pass",
        message: `${formatGBP(application.previouslyCertifiedPence)} matches the certified total on application #${previous.number}.`,
        expected: `${formatGBP(previous.certifiedPence)} (application #${previous.number})`,
        actual: formatGBP(application.previouslyCertifiedPence),
      },
    ];
  }

  const differencePence =
    application.previouslyCertifiedPence - previous.certifiedPence;

  return [
    {
      ...base,
      status: "fail",
      message: `The application states ${formatGBP(application.previouslyCertifiedPence)} previously certified, but application #${previous.number} was certified at ${formatGBP(previous.certifiedPence)} — ${formatGBP(Math.abs(differencePence))} ${differencePence > 0 ? "too high" : "too low"}.`,
      expected: `${formatGBP(previous.certifiedPence)} (application #${previous.number})`,
      actual: formatGBP(application.previouslyCertifiedPence),
    },
  ];
}
