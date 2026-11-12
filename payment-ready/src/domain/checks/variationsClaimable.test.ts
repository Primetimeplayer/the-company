import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { variationsClaimable } from "./variationsClaimable";

function byRef(project: typeof sampleProject, ref: string) {
  const result = variationsClaimable(project).find(
    (candidate) => candidate.id === `variation-claim:${ref}`,
  );
  if (!result) throw new Error(`No result for ${ref}`);
  return result;
}

describe("variationsClaimable", () => {
  it("passes approved and signed variations", () => {
    expect(byRef(sampleProject, "V01").status).toBe("pass");
    expect(byRef(sampleProject, "V02").status).toBe("pass");
    expect(byRef(sampleProject, "V01").message).toContain("signed by J. Whitmore");
  });

  it("catches the approved but unsigned V03", () => {
    const result = byRef(sampleProject, "V03");
    expect(result.status).toBe("fail");
    expect(result.actual).toBe("Approved, not signed");
    expect(result.message).toContain("no signed instruction on file");
    expect(result.sourceDocIds).toContain("ev-v03");
  });

  it("catches the pending V04 claimed anyway", () => {
    const result = byRef(sampleProject, "V04");
    expect(result.status).toBe("fail");
    expect(result.actual).toBe("Pending");
    expect(result.message).toContain("still pending");
  });

  it("fails a claimed variation that is not on the register", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    project.currentApplication.variationsClaimed.push({
      variationRef: "V99",
      claimedPence: 100_000,
    });

    const result = byRef(project, "V99");
    expect(result.status).toBe("fail");
    expect(result.message).toContain("does not exist on the variation register");
  });

  it("fails a claim above the variation value", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    project.currentApplication.variationsClaimed =
      project.currentApplication.variationsClaimed.map(
        (claim: { variationRef: string; claimedPence: number }) =>
          claim.variationRef === "V01"
            ? { ...claim, claimedPence: 500_000 }
            : claim,
      );

    const result = byRef(project, "V01");
    expect(result.status).toBe("fail");
    expect(result.expected).toBe("No more than £4,500.00");
    expect(result.actual).toBe("£5,000.00 claimed");
    expect(result.message).toContain("£500.00 more than the variation allows");
  });

  it("tags each failure with a machine-readable reason", () => {
    const overClaimed = JSON.parse(JSON.stringify(sampleProject));
    overClaimed.currentApplication.variationsClaimed =
      overClaimed.currentApplication.variationsClaimed.map(
        (claim: { variationRef: string; claimedPence: number }) =>
          claim.variationRef === "V01"
            ? { ...claim, claimedPence: 900_000 }
            : claim,
      );
    expect(byRef(overClaimed, "V01").reason).toBe("overclaimed");

    expect(byRef(sampleProject, "V03").reason).toBe("unsigned");
    expect(byRef(sampleProject, "V04").reason).toBe("not_approved");

    const unregistered = JSON.parse(JSON.stringify(sampleProject));
    unregistered.currentApplication.variationsClaimed.push({
      variationRef: "V99",
      claimedPence: 100_000,
    });
    expect(byRef(unregistered, "V99").reason).toBe("unregistered");
  });

  it("passes every claim on the clean fixture", () => {
    expect(
      variationsClaimable(cleanProject).every((result) => result.status === "pass"),
    ).toBe(true);
  });
});
