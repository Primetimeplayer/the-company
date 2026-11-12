import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { revisedContractValue } from "./revisedContractValue";

describe("revisedContractValue", () => {
  it("adds approved variations to the original value", () => {
    const [result] = revisedContractValue(sampleProject);
    expect(result?.status).toBe("pass");
    expect(result?.expected).toBe("£110,000.00");
    expect(result?.message).toContain("£100,000.00 original value");
    expect(result?.message).toContain("£10,000.00 across 3 approved variations");
  });

  it("excludes pending variations from the revised value", () => {
    const [result] = revisedContractValue(sampleProject);
    expect(result?.message).toContain("V04 (pending, £1,800.00)");
  });

  it("reflects an approved V04 on the clean fixture", () => {
    const [result] = revisedContractValue(cleanProject);
    expect(result?.status).toBe("pass");
    expect(result?.expected).toBe("£111,800.00");
  });

  it("excludes rejected variations", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    project.variations[0].status = "rejected";
    const [result] = revisedContractValue(project);
    expect(result?.expected).toBe("£105,500.00");
  });
});
