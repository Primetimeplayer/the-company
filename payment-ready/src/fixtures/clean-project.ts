import { percentOfPence } from "@/domain/money";
import type { Project } from "@/domain/types";
import { sampleProject } from "./sample-project";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * A corrected version of the sample project, used by the tests to prove the
 * rules engine can reach a fully clean result.
 *
 * Fixed: L3 valuation, cumulative total, retention rate, previously certified
 * figure, amount due, unsigned V03, pending V04, expired public liability and
 * the missing L5 photo. Submitted on the contractual application date.
 */
function buildCleanProject(): Project {
  const project = clone(sampleProject);

  project.referenceDate = "2026-01-27";
  project.currentApplication.submissionDate = "2026-01-25";

  project.currentApplication.lineItems = project.currentApplication.lineItems.map(
    (item) =>
      item.ref === "L3"
        ? { ...item, claimedPence: percentOfPence(item.contractValuePence, item.percentComplete) }
        : item,
  );

  project.currentApplication.cumulativeGrossPence = 8_090_000;
  project.currentApplication.retentionPence = 404_500;
  project.currentApplication.previouslyCertifiedPence = 7_420_000;
  project.currentApplication.amountDuePence = 265_500;

  project.variations = project.variations.map((variation) => {
    if (variation.ref === "V03" || variation.ref === "V04") {
      return {
        ...variation,
        status: "approved",
        signedBy: "J. Whitmore (Northgate Build Ltd)",
        signedDate: variation.ref === "V03" ? "2026-01-12" : "2026-01-19",
      };
    }
    return variation;
  });

  project.complianceDocs = project.complianceDocs.map((doc) =>
    doc.type === "public_liability" ? { ...doc, expiryDate: "2027-01-22" } : doc,
  );

  project.evidenceDocs = [
    ...project.evidenceDocs,
    {
      id: "ev-photo-l5",
      fileName: "Photo_L5_fire_alarm.jpg",
      kind: "photo",
      linkedRefs: ["L5"],
    },
  ];

  return project;
}

export const cleanProject: Project = buildCleanProject();
