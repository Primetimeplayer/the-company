import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { cumulativeTotal } from "./cumulativeTotal";

describe("cumulativeTotal", () => {
  it("catches the planted cumulative gross error", () => {
    const [result] = cumulativeTotal(sampleProject);
    expect(result?.status).toBe("fail");
    expect(result?.actual).toBe("£80,000.00");
    expect(result?.expected).toContain("£81,350.00");
    expect(result?.message).toContain("£1,350.00 too low");
  });

  it("adds line items and variation claims", () => {
    const [result] = cumulativeTotal(cleanProject);
    expect(result?.status).toBe("pass");
    expect(result?.message).toContain("£69,100.00 of line items");
    expect(result?.message).toContain("£11,800.00 of variation claims");
    expect(result?.message).toContain("£80,900.00");
  });
});
