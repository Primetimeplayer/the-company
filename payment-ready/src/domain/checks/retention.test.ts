import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { retention } from "./retention";

describe("retention", () => {
  it("catches retention applied at 3% instead of 5%", () => {
    const [result] = retention(sampleProject);
    expect(result?.status).toBe("fail");
    expect(result?.expected).toBe("5% = £4,000.00");
    expect(result?.actual).toBe("3% = £2,400.00");
    expect(result?.message).toContain("subcontract rate is 5%");
  });

  it("passes when retention is 5% of cumulative gross", () => {
    const [result] = retention(cleanProject);
    expect(result?.status).toBe("pass");
    expect(result?.expected).toBe("5% = £4,045.00");
  });

  it("respects the retention cap", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    project.currentApplication.cumulativeGrossPence = 12_000_000;
    project.currentApplication.retentionPence = 500_000;

    const [result] = retention(project);
    expect(result?.status).toBe("pass");
    expect(result?.message).toContain("Cap: 5% of the subcontract value (£5,000.00)");
  });

  it("treats a missing cap as uncapped", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    delete project.subcontract.retentionCapPercent;
    project.currentApplication.cumulativeGrossPence = 12_000_000;
    project.currentApplication.retentionPence = 600_000;

    const [result] = retention(project);
    expect(result?.status).toBe("pass");
  });
});
