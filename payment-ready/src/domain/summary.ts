import type { CheckResult } from "./types";

export interface CheckSummary {
  headline: string;
  detail: string;
  issues: number;
  missing: number;
  warnings: number;
}

interface Action {
  weight: number;
  action: string;
}

/** Deterministic action wording per check. No AI is involved. */
function actionFor(result: CheckResult): Action | undefined {
  if (result.id === "retention") {
    return { weight: 1, action: "fix the retention rate" };
  }
  if (result.id.startsWith("variation-claim:")) {
    const ref = result.id.split(":")[1] ?? "the variation";
    return { weight: 2, action: `get ${ref} signed` };
  }
  if (result.id.startsWith("compliance:")) {
    return {
      weight: 3,
      action: `renew the ${result.title.toLowerCase()}`,
    };
  }
  if (result.id === "cumulative-total") {
    return { weight: 4, action: "reconcile the cumulative total" };
  }
  if (result.id === "previously-certified") {
    return { weight: 5, action: "align the previously certified figure" };
  }
  if (result.id === "amount-due") {
    return { weight: 6, action: "recheck the amount due" };
  }
  if (result.id.startsWith("line-item-maths:")) {
    const ref = result.id.split(":")[1] ?? "the line item";
    return { weight: 7, action: `correct the ${ref} valuation` };
  }
  if (result.id.startsWith("evidence:photos:")) {
    const ref = result.id.split(":")[2] ?? "the line item";
    return { weight: 8, action: `add a photo for ${ref}` };
  }
  if (result.id === "evidence:delivery-notes") {
    return { weight: 9, action: "upload the missing delivery notes" };
  }
  if (result.id === "evidence:valuation-template") {
    return { weight: 10, action: "use the client valuation template" };
  }
  return undefined;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Build the summary card text from the check results. The wording is fixed
 * per check id so it is fully deterministic.
 */
export function buildSummary(results: CheckResult[]): CheckSummary {
  const failed = results.filter((result) => result.status === "fail");
  const missing = results.filter((result) => result.status === "missing");
  const warnings = results.filter((result) => result.status === "warning");
  const passed = results.filter((result) => result.status === "pass");
  const issues = failed.length;

  if (issues === 0 && missing.length === 0) {
    if (warnings.length === 0) {
      return {
        headline: `Ready to submit — all ${results.length} checks passed.`,
        detail: `Every figure reconciles and all required evidence is on file. Submit on the client template and diarise the payment notice date.`,
        issues,
        missing: missing.length,
        warnings: warnings.length,
      };
    }
    return {
      headline: `No blocking issues — ${warnings.length} warning${warnings.length === 1 ? "" : "s"} to review.`,
      detail: `${passed.length} of ${results.length} checks passed. Read the warnings below before the application goes out.`,
      issues,
      missing: missing.length,
      warnings: warnings.length,
    };
  }

  const actions = [...failed, ...missing]
    .map(actionFor)
    .filter((action): action is Action => action !== undefined)
    .sort((a, b) => a.weight - b.weight)
    .map((action) => action.action);

  const uniqueActions = Array.from(new Set(actions)).slice(0, 2);
  const actionText =
    uniqueActions.length === 0
      ? "Review the failing checks below before submitting."
      : `${capitalise(uniqueActions.join(" and "))} before submitting.`;

  const warningNote =
    warnings.length > 0
      ? ` Plus ${warnings.length} warning${warnings.length === 1 ? "" : "s"} to review.`
      : "";

  return {
    headline: `${issues} issue${issues === 1 ? "" : "s"} and ${missing.length} missing item${missing.length === 1 ? "" : "s"}.${warningNote}`,
    detail: actionText,
    issues,
    missing: missing.length,
    warnings: warnings.length,
  };
}
