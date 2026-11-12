import { describe, expect, it } from "vitest";
import { WALKTHROUGH_URL } from "./config";

describe("WALKTHROUGH_URL", () => {
  it("is a usable link rather than a placeholder page", () => {
    expect(WALKTHROUGH_URL).toMatch(/^(mailto:|https:\/\/)/);
    expect(() => new URL(WALKTHROUGH_URL)).not.toThrow();
  });

  it("carries a walkthrough subject when it is an email link", () => {
    expect(decodeURIComponent(WALKTHROUGH_URL)).toContain("walkthrough");
  });
});
