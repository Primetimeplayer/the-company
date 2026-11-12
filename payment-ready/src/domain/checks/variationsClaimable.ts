import { formatGBP } from "../money";
import { formatDate } from "@/lib/dates";
import type { CheckResult, Project } from "../types";

/**
 * Rule 7: a claimed variation must exist, be approved, not be over-claimed, and
 * (per the client's signed-variations rule) carry a signature.
 */
export function variationsClaimable(project: Project): CheckResult[] {
  const application = project.currentApplication;
  const requiresSignature = project.clientRequirements.some(
    (requirement) => requirement.rule === "signed_variations_only",
  );

  return application.variationsClaimed.map((claim) => {
    const variation = project.variations.find(
      (candidate) => candidate.ref === claim.variationRef,
    );
    const base = {
      id: `variation-claim:${claim.variationRef}`,
      title: `${claim.variationRef} variation claim`,
      category: "variations" as const,
      sourceDocIds: variation ? [variation.sourceDocId] : [application.sourceDocId],
    };

    if (!variation) {
      return {
        ...base,
        status: "fail" as const,
        reason: "unregistered" as const,
        message: `${claim.variationRef} is claimed at ${formatGBP(claim.claimedPence)} but does not exist on the variation register.`,
        expected: "A registered, approved variation",
        actual: "No matching variation",
      };
    }

    if (claim.claimedPence > variation.valuePence) {
      return {
        ...base,
        status: "fail" as const,
        reason: "overclaimed" as const,
        message: `${variation.ref} is claimed at ${formatGBP(claim.claimedPence)} but is only valued at ${formatGBP(variation.valuePence)} — ${formatGBP(claim.claimedPence - variation.valuePence)} more than the variation allows.`,
        expected: `No more than ${formatGBP(variation.valuePence)}`,
        actual: `${formatGBP(claim.claimedPence)} claimed`,
      };
    }

    if (variation.status !== "approved") {
      return {
        ...base,
        status: "fail" as const,
        reason: "not_approved" as const,
        message: `${variation.ref} is claimed at ${formatGBP(claim.claimedPence)} but is still ${variation.status}. Only approved variations can be included.`,
        expected: "Approved variation",
        actual: `${variation.status.charAt(0).toUpperCase()}${variation.status.slice(1)}`,
      };
    }

    if (requiresSignature && (!variation.signedBy || !variation.signedDate)) {
      return {
        ...base,
        status: "fail" as const,
        reason: "unsigned" as const,
        message: `${variation.ref} (${formatGBP(variation.valuePence)}) is approved but has no signed instruction on file. ${project.subcontract.mainContractor}'s client rule is signed variations only.`,
        expected: "Approved and signed",
        actual: "Approved, not signed",
      };
    }

    const signature = variation.signedBy
      ? ` and signed by ${variation.signedBy} on ${formatDate(variation.signedDate)}`
      : "";

    return {
      ...base,
      status: "pass" as const,
      message: `${variation.ref} (${formatGBP(variation.valuePence)}) is approved${signature}.`,
      expected: "Approved and signed",
      actual: "Approved and signed",
    };
  });
}
