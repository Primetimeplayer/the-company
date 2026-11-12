import { describe, expect, it } from "vitest";
import { cleanProject } from "./clean-project";
import { sampleProject } from "./sample-project";

const fixtures = [
  ["sample", sampleProject],
  ["clean", cleanProject],
] as const;

describe.each(fixtures)("%s fixture", (_name, project) => {
  it("pays certified less retention on every previous application", () => {
    expect(project.previousApplications.length).toBeGreaterThan(0);

    for (const application of project.previousApplications) {
      expect(application.paidPence).toBe(
        application.certifiedPence - application.retentionHeldPence,
      );
    }
  });

  it("keeps retention held consistent with the cumulative gross", () => {
    for (const application of project.previousApplications) {
      expect(application.retentionHeldPence).toBe(
        Math.round(
          (application.cumulativeGrossPence * 5) / 100,
        ),
      );
    }
  });
});

describe("compliance fixtures", () => {
  it("sample is missing the RAMS pack", () => {
    expect(sampleProject.complianceDocs.some((doc) => doc.type === "rams")).toBe(
      false,
    );
  });

  it("clean fixture has the RAMS pack on file", () => {
    expect(cleanProject.complianceDocs.some((doc) => doc.type === "rams")).toBe(
      true,
    );
    expect(
      cleanProject.evidenceDocs.some((doc) => doc.id === "ev-rams"),
    ).toBe(true);
  });
});
