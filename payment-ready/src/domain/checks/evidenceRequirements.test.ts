import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { evidenceRequirements } from "./evidenceRequirements";

function byId(project: typeof sampleProject, id: string) {
  const result = evidenceRequirements(project).find(
    (candidate) => candidate.id === id,
  );
  if (!result) throw new Error(`No result for ${id}`);
  return result;
}

describe("evidenceRequirements", () => {
  it("passes photos for line items above 50% that have one", () => {
    expect(byId(sampleProject, "evidence:photos:L1").status).toBe("pass");
    expect(byId(sampleProject, "evidence:photos:L3").status).toBe("pass");
  });

  it("catches the missing L5 fire alarm photo", () => {
    const result = byId(sampleProject, "evidence:photos:L5");
    expect(result.status).toBe("missing");
    expect(result.actual).toBe("0 photos on file");
    expect(result.message).toContain("Fire alarm first fix");
    expect(result.message).toContain("55% complete");
  });

  it("does not require photos for line items at or below 50%", () => {
    const ids = evidenceRequirements(sampleProject).map((result) => result.id);
    expect(ids).not.toContain("evidence:photos:L4");
    expect(ids).not.toContain("evidence:photos:L6");
  });

  it("catches unsigned variations under the signed-variations rule", () => {
    const result = byId(sampleProject, "evidence:signed-variations");
    expect(result.status).toBe("fail");
    expect(result.actual).toContain("V03 (approved but unsigned)");
    expect(result.actual).toContain("V04 (still pending)");
  });

  it("passes delivery notes for material line items", () => {
    const result = byId(sampleProject, "evidence:delivery-notes");
    expect(result.status).toBe("pass");
    expect(result.message).toContain("all 6 line items");
  });

  it("flags a missing delivery note", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    project.evidenceDocs = project.evidenceDocs.filter(
      (doc: { id: string }) => doc.id !== "ev-dn-2",
    );

    const result = byId(project, "evidence:delivery-notes");
    expect(result.status).toBe("missing");
    expect(result.message).toContain("L4 (£7,200.00)");
  });

  it("accepts the client valuation template", () => {
    const result = byId(sampleProject, "evidence:valuation-template");
    expect(result.status).toBe("pass");
    expect(result.message).toContain("Valuation_App04.xlsx");
  });

  it("is clean on the corrected fixture", () => {
    expect(
      evidenceRequirements(cleanProject).every(
        (result) => result.status === "pass",
      ),
    ).toBe(true);
  });
});
