import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { complianceValidity } from "./complianceValidity";

function byType(project: typeof sampleProject, type: string) {
  const result = complianceValidity(project).find(
    (candidate) => candidate.id === `compliance:${type}`,
  );
  if (!result) throw new Error(`No result for ${type}`);
  return result;
}

describe("complianceValidity", () => {
  it("catches public liability expiring 10 days before submission", () => {
    const result = byType(sampleProject, "public_liability");
    expect(result.status).toBe("fail");
    expect(result.expected).toBe("Valid on 27/01/2026");
    expect(result.actual).toBe("Expired 17/01/2026");
    expect(result.message).toContain("10 days before the application was submitted");
  });

  it("reports RAMS as missing when nothing is on file", () => {
    const result = byType(sampleProject, "rams");
    expect(result.status).toBe("missing");
    expect(result.actual).toBe("Not on file");
    expect(result.message).toContain("RAMS pack");
    expect(result.sourceDocIds.length).toBeGreaterThan(0);
  });

  it("checks every required compliance type", () => {
    const results = complianceValidity(sampleProject);
    expect(results).toHaveLength(5);
    expect(results.map((result) => result.id)).toEqual([
      "compliance:public_liability",
      "compliance:employers_liability",
      "compliance:cscs",
      "compliance:rams",
      "compliance:cis_verification",
    ]);
  });

  it("passes valid employers' liability and CIS verification", () => {
    expect(byType(sampleProject, "employers_liability").status).toBe("pass");
    expect(byType(sampleProject, "cis_verification").status).toBe("pass");
  });

  it("warns when a document expires within 30 days of submission", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    const doc = project.complianceDocs.find(
      (candidate: { type: string }) => candidate.type === "employers_liability",
    );
    if (!doc) throw new Error("missing doc");
    doc.expiryDate = "2026-02-20";

    const result = byType(project, "employers_liability");
    expect(result.status).toBe("warning");
    expect(result.message).toContain("24 days after submission");
  });

  it("warns when no expiry date is recorded", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    const doc = project.complianceDocs.find(
      (candidate: { type: string }) => candidate.type === "cscs",
    );
    if (!doc) throw new Error("missing doc");
    delete doc.expiryDate;

    expect(byType(project, "cscs").status).toBe("warning");
  });

  it("passes every document on the clean fixture", () => {
    const results = complianceValidity(cleanProject);
    expect(results).toHaveLength(5);
    expect(results.every((result) => result.status === "pass")).toBe(true);
  });
});
