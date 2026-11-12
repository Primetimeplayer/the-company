import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { amountDue } from "./amountDue";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("amountDue", () => {
  it("warns when the stated amount differs from the corrected figures", () => {
    const [result] = amountDue(sampleProject);
    expect(result?.status).toBe("warning");
    expect(result?.expected).toBe(
      "£3,082.50 corrected (£81,350.00 − £4,067.50 − £74,200.00 = £3,082.50)",
    );
    expect(result?.actual).toBe("£1,600.00 stated");
    expect(result?.message).toContain("£1,482.50 more than stated");
  });

  it("fails when the stated amount does not follow from the stated figures", () => {
    const project = clone(sampleProject);
    project.currentApplication.amountDuePence = 210_000;

    const [result] = amountDue(project);
    expect(result?.status).toBe("fail");
    expect(result?.expected).toContain("£1,600.00 from the stated figures");
    expect(result?.actual).toBe("£2,100.00");
  });

  it("passes on the corrected fixture", () => {
    const [result] = amountDue(cleanProject);
    expect(result?.status).toBe("pass");
    expect(result?.expected).toBe(
      "£80,900.00 − £4,045.00 − £74,200.00 = £2,655.00",
    );
    expect(result?.actual).toBe("£2,655.00");
  });
});
