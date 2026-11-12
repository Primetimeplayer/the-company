import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { amountDue } from "./amountDue";

describe("amountDue", () => {
  it("passes when the arithmetic is internally consistent", () => {
    const [result] = amountDue(sampleProject);
    expect(result?.status).toBe("pass");
    expect(result?.actual).toBe("£1,600.00");
    expect(result?.expected).toContain("£80,000.00 − £2,400.00 − £76,000.00");
  });

  it("fails when the stated amount due is wrong", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    project.currentApplication.amountDuePence = 210_000;

    const [result] = amountDue(project);
    expect(result?.status).toBe("fail");
    expect(result?.message).toContain("£500.00 difference");
    expect(result?.actual).toBe("£2,100.00");
  });

  it("passes on the corrected fixture", () => {
    const [result] = amountDue(cleanProject);
    expect(result?.status).toBe("pass");
    expect(result?.actual).toBe("£2,655.00");
  });
});
