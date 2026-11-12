import { formatGBP } from "../money";
import type { CheckResult, Project } from "../types";
import { evidenceLinkedTo, findEvidence } from "./shared";

const MATERIAL_THRESHOLD_PENCE = 200_000;

/** Rule 9: apply the main contractor's evidence requirements. */
export function evidenceRequirements(project: Project): CheckResult[] {
  const application = project.currentApplication;
  const valuationDocId = application.sourceDocId;
  const results: CheckResult[] = [];

  for (const requirement of project.clientRequirements) {
    switch (requirement.rule) {
      case "photos_per_line_item": {
        const qualifying = application.lineItems.filter(
          (item) => item.percentComplete > 50,
        );

        for (const item of qualifying) {
          const photos = evidenceLinkedTo(project, "photo", item.ref);
          const sourceDocIds =
            photos.length > 0
              ? [valuationDocId, ...photos.map((photo) => photo.id)]
              : [valuationDocId];

          if (photos.length > 0) {
            results.push({
              id: `evidence:photos:${item.ref}`,
              title: `Photo evidence — ${item.ref}`,
              category: "evidence",
              status: "pass",
              message: `${item.ref} – ${item.description} is ${item.percentComplete}% complete and has ${photos.length} photo${photos.length === 1 ? "" : "s"} on file (${photos.map((photo) => photo.fileName).join(", ")}).`,
              expected: `At least 1 photo linked to ${item.ref}`,
              actual: `${photos.length} photo${photos.length === 1 ? "" : "s"} on file`,
              sourceDocIds,
            });
            continue;
          }

          results.push({
            id: `evidence:photos:${item.ref}`,
            title: `Photo evidence — ${item.ref}`,
            category: "evidence",
            status: "missing",
            message: `${project.subcontract.mainContractor} requires a photo for ${item.ref} – ${item.description} (${item.percentComplete}% complete, ${formatGBP(item.claimedPence)} claimed). No photo is linked to this line item.`,
            expected: `At least 1 photo linked to ${item.ref}`,
            actual: "0 photos on file",
            sourceDocIds,
          });
        }
        break;
      }

      case "signed_variations_only": {
        const problems = application.variationsClaimed.flatMap((claim) => {
          const variation = project.variations.find(
            (candidate) => candidate.ref === claim.variationRef,
          );
          if (!variation) return [`${claim.variationRef} (not on the register)`];
          if (variation.status === "pending")
            return [`${variation.ref} (still pending)`];
          if (variation.status === "rejected")
            return [`${variation.ref} (rejected)`];
          if (!variation.signedBy || !variation.signedDate)
            return [`${variation.ref} (approved but unsigned)`];
          return [];
        });

        const signedRefs = application.variationsClaimed
          .map((claim) => claim.variationRef)
          .filter((ref) => !problems.some((problem) => problem.startsWith(ref)));

        if (problems.length === 0) {
          results.push({
            id: "evidence:signed-variations",
            title: "Signed variations only",
            category: "evidence",
            status: "pass",
            message: `All ${application.variationsClaimed.length} claimed variations have a signed instruction on file.`,
            expected: "Signed instruction for every claimed variation",
            actual: "All claimed variations signed",
            sourceDocIds: project.evidenceDocs
              .filter(
                (doc) =>
                  doc.kind === "variation" &&
                  doc.linkedRefs.some((ref) =>
                    application.variationsClaimed.some((claim) => claim.variationRef === ref),
                  ),
              )
              .map((doc) => doc.id),
          });
          break;
        }

        results.push({
          id: "evidence:signed-variations",
          title: "Signed variations only",
          category: "evidence",
          status: "fail",
          message: `The client rule is signed variations only: ${problems.join(", ")}. ${signedRefs.length > 0 ? `${signedRefs.join(", ")} are properly signed.` : ""}`.trim(),
          expected: "Signed instruction for every claimed variation",
          actual: problems.join("; "),
          sourceDocIds: application.variationsClaimed.map((claim) => {
            const variation = project.variations.find(
              (candidate) => candidate.ref === claim.variationRef,
            );
            return variation?.sourceDocId ?? valuationDocId;
          }),
        });
        break;
      }

      case "delivery_notes_for_materials": {
        const materialItems = application.lineItems.filter(
          (item) => item.claimedPence >= MATERIAL_THRESHOLD_PENCE,
        );
        const missing = materialItems.filter(
          (item) => evidenceLinkedTo(project, "delivery_note", item.ref).length === 0,
        );

        if (missing.length === 0) {
          results.push({
            id: "evidence:delivery-notes",
            title: "Delivery notes for materials",
            category: "evidence",
            status: "pass",
            message: `Delivery notes are on file for all ${materialItems.length} line items claimed at ${formatGBP(MATERIAL_THRESHOLD_PENCE)} or more.`,
            expected: `${materialItems.length} line items with delivery notes`,
            actual: `${materialItems.length} line items covered`,
            sourceDocIds: [
              valuationDocId,
              ...project.evidenceDocs
                .filter((doc) => doc.kind === "delivery_note")
                .map((doc) => doc.id),
            ],
          });
          break;
        }

        results.push({
          id: "evidence:delivery-notes",
          title: "Delivery notes for materials",
          category: "evidence",
          status: "missing",
          message: `Delivery notes are missing for ${missing
            .map((item) => `${item.ref} (${formatGBP(item.claimedPence)})`)
            .join(", ")}.`,
          expected: `${materialItems.length} line items with delivery notes`,
          actual: `${materialItems.length - missing.length} of ${materialItems.length} covered`,
          sourceDocIds: [valuationDocId],
        });
        break;
      }

      case "valuation_template": {
        const templateRef = `APP-${String(application.number).padStart(2, "0")}`;
        const templateDoc = findEvidence(
          project,
          (doc) => doc.kind === "valuation" && doc.linkedRefs.includes(templateRef),
        );

        if (templateDoc.length > 0) {
          results.push({
            id: "evidence:valuation-template",
            title: "Client valuation template",
            category: "evidence",
            status: "pass",
            message: `${templateDoc[0]?.fileName ?? "Valuation file"} uses the ${project.subcontract.mainContractor} template reference ${templateRef}.`,
            expected: `Valuation submitted on the client template (${templateRef})`,
            actual: templateDoc[0]?.fileName ?? "Template on file",
            sourceDocIds: templateDoc.map((doc) => doc.id),
          });
          break;
        }

        results.push({
          id: "evidence:valuation-template",
          title: "Client valuation template",
          category: "evidence",
          status: "missing",
          message: `No valuation file is linked to template reference ${templateRef}. Upload the application on the client's workbook.`,
          expected: `Valuation submitted on the client template (${templateRef})`,
          actual: "No template valuation on file",
          sourceDocIds: [valuationDocId],
        });
        break;
      }
    }
  }

  return results;
}
