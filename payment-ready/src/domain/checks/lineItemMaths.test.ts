import { describe, expect, it } from "vitest";
import { percentOfPence } from "../money";
import type { Project } from "../types";
import { lineItemMaths } from "./lineItemMaths";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function resultFor(project: Project, ref: string) {
  const result = lineItemMaths(project).find(
    (candidate) => candidate.id === `line-item-maths:${ref}`,
  );
  if (!result) throw new Error(`No result for ${ref}`);
  return result;
}

describe("lineItemMaths", () => {
  it("passes when claimed equals contract value × percent complete", () => {
    const result = resultFor(sampleProject, "L1");
    expect(result.status).toBe("pass");
    expect(result.expected).toBe("£20,000.00 (100% of £20,000.00)");
    expect(result.actual).toBe("£20,000.00 claimed");
  });

  it("catches the planted £450 over-claim on L3", () => {
    const result = resultFor(sampleProject, "L3");
    expect(result.status).toBe("fail");
    expect(result.expected).toBe("£12,600.00 (70% of £18,000.00)");
    expect(result.actual).toBe("£13,050.00 claimed");
    expect(result.message).toContain("£450.00 over-claimed");
    expect(result.sourceDocIds).toContain("ev-valuation");
  });

  it("catches an under-claim", () => {
    const project = clone(sampleProject);
    const item = project.currentApplication.lineItems[1];
    if (!item) throw new Error("missing line item");
    item.claimedPence = 1_900_000;

    const result = resultFor(project, "L2");
    expect(result.status).toBe("fail");
    expect(result.message).toContain("£200.00 under-claimed");
  });

  it("rounds percentages to the nearest penny", () => {
    const project = clone(sampleProject);
    const item = project.currentApplication.lineItems[0];
    if (!item) throw new Error("missing line item");
    item.contractValuePence = 999_999;
    item.percentComplete = 33.33;
    item.claimedPence = percentOfPence(999_999, 33.33);

    expect(item.claimedPence).toBe(333_300);
    expect(resultFor(project, "L1").status).toBe("pass");
  });

  it("returns one result per line item", () => {
    expect(lineItemMaths(sampleProject)).toHaveLength(
      sampleProject.currentApplication.lineItems.length,
    );
  });

  it("is clean on the corrected fixture", () => {
    expect(lineItemMaths(cleanProject).every((result) => result.status === "pass")).toBe(
      true,
    );
  });
});
