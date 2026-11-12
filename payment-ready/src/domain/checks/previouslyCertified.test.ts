import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { previouslyCertified } from "./previouslyCertified";

describe("previouslyCertified", () => {
  it("catches the planted mismatch against application #3", () => {
    const [result] = previouslyCertified(sampleProject);
    expect(result?.status).toBe("fail");
    expect(result?.expected).toBe("£74,200.00 (application #3)");
    expect(result?.actual).toBe("£76,000.00");
    expect(result?.message).toContain("£1,800.00 too high");
  });

  it("passes when it matches the last previous application", () => {
    const [result] = previouslyCertified(cleanProject);
    expect(result?.status).toBe("pass");
    expect(result?.message).toContain("matches the certified total on application #3");
  });

  it("compares against the highest application number, not array order", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    project.previousApplications = [...project.previousApplications].reverse();
    const [result] = previouslyCertified(project);
    expect(result?.expected).toBe("£74,200.00 (application #3)");
  });

  it("warns when there are no previous applications", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    project.previousApplications = [];
    const [result] = previouslyCertified(project);
    expect(result?.status).toBe("warning");
  });
});
