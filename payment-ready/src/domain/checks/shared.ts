import type {
  CheckResult,
  EvidenceDoc,
  PreviousApplication,
  Project,
} from "../types";
import { percentOfPence, sumPence } from "../money";

/** Totals derived straight from the line items and variation claims. */
export function trueCumulativeGrossPence(project: Project): number {
  return (
    sumLineItemsClaimedPence(project) + sumVariationsClaimedPence(project)
  );
}

export function sumLineItemsClaimedPence(project: Project): number {
  return sumPence(project.currentApplication.lineItems.map((item) => item.claimedPence));
}

export function sumVariationsClaimedPence(project: Project): number {
  return sumPence(
    project.currentApplication.variationsClaimed.map((claim) => claim.claimedPence),
  );
}

export function approvedVariations(project: Project) {
  return project.variations.filter((variation) => variation.status === "approved");
}

export function revisedContractValuePence(project: Project): number {
  return (
    project.subcontract.originalValuePence +
    sumPence(approvedVariations(project).map((variation) => variation.valuePence))
  );
}

/** Retention cap in pence, or undefined when the subcontract has no cap. */
export function retentionCapPence(project: Project): number | undefined {
  const { retentionCapPercent, originalValuePence } = project.subcontract;
  if (retentionCapPercent === undefined) return undefined;
  return percentOfPence(originalValuePence, retentionCapPercent);
}

export function expectedRetentionPence(
  project: Project,
  grossPence: number,
): number {
  const uncapped = percentOfPence(grossPence, project.subcontract.retentionPercent);
  const cap = retentionCapPence(project);
  return cap === undefined ? uncapped : Math.min(uncapped, cap);
}

export function lastPreviousApplication(
  project: Project,
): PreviousApplication | undefined {
  return [...project.previousApplications].sort((a, b) => b.number - a.number)[0];
}

export function findEvidence(
  project: Project,
  predicate: (doc: EvidenceDoc) => boolean,
): EvidenceDoc[] {
  return project.evidenceDocs.filter(predicate);
}

export function evidenceLinkedTo(
  project: Project,
  kind: EvidenceDoc["kind"],
  ref: string,
): EvidenceDoc[] {
  return findEvidence(
    project,
    (doc) => doc.kind === kind && doc.linkedRefs.includes(ref),
  );
}

/** Pass result with no diffs. */
export function pass(
  result: Omit<CheckResult, "status">,
): CheckResult {
  return { ...result, status: "pass" };
}
