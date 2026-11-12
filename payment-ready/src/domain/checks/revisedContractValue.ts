import { formatGBP, sumPence } from "../money";
import type { CheckResult, Project } from "../types";
import { approvedVariations } from "./shared";

/** Rule 2: revised contract value = original value + approved variations. */
export function revisedContractValue(project: Project): CheckResult[] {
  const approved = approvedVariations(project);
  const approvedTotalPence = sumPence(approved.map((variation) => variation.valuePence));
  const revisedPence = project.subcontract.originalValuePence + approvedTotalPence;
  const excluded = project.variations.filter(
    (variation) => variation.status !== "approved",
  );
  const excludedNote =
    excluded.length > 0
      ? ` Excluded: ${excluded
          .map((variation) => `${variation.ref} (${variation.status}, ${formatGBP(variation.valuePence)})`)
          .join(", ")}.`
      : "";

  return [
    {
      id: "revised-contract-value",
      title: "Revised contract value",
      category: "money",
      status: "pass",
      informational: true,
      message: `Revised contract value is ${formatGBP(revisedPence)}: ${formatGBP(project.subcontract.originalValuePence)} original value plus ${formatGBP(approvedTotalPence)} across ${approved.length} approved variation${approved.length === 1 ? "" : "s"}.${excludedNote}`,
      expected: formatGBP(revisedPence),
      actual: `${formatGBP(project.subcontract.originalValuePence)} + ${formatGBP(approvedTotalPence)} approved variations`,
      sourceDocIds: ["ev-subcontract"],
    },
  ];
}
