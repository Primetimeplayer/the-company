import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { retention } from "./retention";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("retention", () => {
  it("reports the corrected retention from the true cumulative gross", () => {
    const [result] = retention(sampleProject);
    expect(result?.status).toBe("fail");
    expect(result?.expected).toBe(
      "5% of corrected cumulative £81,350.00 = £4,067.50",
    );
    expect(result?.actual).toBe("£2,400.00 stated (3% of £80,000.00)");
    expect(result?.message).toContain("£1,667.50 more than stated");
    expect(result?.message).toContain("£4,067.50");
  });

  it("passes when the stated retention equals the corrected figure", () => {
    const [result] = retention(cleanProject);
    expect(result?.status).toBe("pass");
    expect(result?.expected).toBe(
      "5% of corrected cumulative £80,900.00 = £4,045.00",
    );
  });

  it("applies the cap to the revised signed contract value", () => {
    const project = clone(sampleProject);
    project.subcontract.retentionCapPercent = 3;
    // 10,770,000 (original + V01 + V02) × 3% = 323,100. Unsigned V03 is excluded.
    project.currentApplication.retentionPence = 323_100;

    const [result] = retention(project);
    expect(result?.status).toBe("pass");
    expect(result?.expected).toBe(
      "5% of corrected cumulative £81,350.00 = £3,231.00",
    );
    expect(result?.message).toContain(
      "Cap: 3% of the revised contract value (£3,231.00)",
    );
  });

  it("does not cap when the subcontract sets no cap", () => {
    const project = clone(sampleProject);
    const [result] = retention(project);
    expect(result?.message).not.toContain("Cap:");
  });

  it("fails when the stated rate is wrong even if the gross is right", () => {
    const project = clone(sampleProject);
    project.currentApplication.retentionPence = 400_000;

    const [result] = retention(project);
    expect(result?.status).toBe("fail");
    expect(result?.actual).toBe("£4,000.00 stated (5% of £80,000.00)");
    expect(result?.message).toContain("£67.50 more than stated");
  });
});
