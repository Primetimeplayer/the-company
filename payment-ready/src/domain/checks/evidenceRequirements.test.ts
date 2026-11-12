import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { evidenceRequirements } from "./evidenceRequirements";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

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

  it("summarises the signed-variations client rule without failing it", () => {
    const result = byId(sampleProject, "evidence:signed-variations");
    expect(result.status).toBe("warning");
    expect(result.informational).toBe(true);
    expect(result.actual).toBe("V03, V04");
    expect(result.message).toContain("V03 (approved but unsigned)");
    expect(result.message).toContain("V04 (still pending)");
  });

  it("matches variation refs exactly rather than by prefix", () => {
    const project = clone(sampleProject);
    project.variations.push(
      {
        id: "var-1",
        ref: "V1",
        description: "Prefix-collision variation",
        valuePence: 100_000,
        status: "approved",
        sourceDocId: "ev-v01",
      },
      {
        id: "var-10",
        ref: "V10",
        description: "Signed variation with a longer ref",
        valuePence: 100_000,
        status: "approved",
        signedBy: "J. Whitmore (Northgate Build Ltd)",
        signedDate: "2026-01-10",
        sourceDocId: "ev-v02",
      },
    );
    project.currentApplication.variationsClaimed.push(
      { variationRef: "V1", claimedPence: 100_000 },
      { variationRef: "V10", claimedPence: 100_000 },
    );

    const result = byId(project, "evidence:signed-variations");
    expect(result.message).toContain("V1 (approved but unsigned)");
    expect(result.message).toContain("Properly signed: V01, V02, V10");
  });

  it("passes delivery notes for material line items", () => {
    const result = byId(sampleProject, "evidence:delivery-notes");
    expect(result.status).toBe("pass");
    expect(result.message).toContain("all 6 line items");
  });

  it("flags a missing delivery note", () => {
    const project = clone(sampleProject);
    project.evidenceDocs = project.evidenceDocs.filter(
      (doc) => doc.id !== "ev-dn-2",
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
