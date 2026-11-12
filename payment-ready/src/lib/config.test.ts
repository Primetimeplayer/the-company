import { describe, expect, it } from "vitest";
import { WALKTHROUGH_URL } from "./config";

describe("WALKTHROUGH_URL", () => {
  it("is a usable link rather than a placeholder page", () => {
    expect(WALKTHROUGH_URL).toMatch(/^(mailto:|https:\/\/)/);
    expect(() => new URL(WALKTHROUGH_URL)).not.toThrow();
  });

  it("points at the real booking page", () => {
    expect(WALKTHROUGH_URL).toBe(
      "https://calendly.com/primetimeplayer45/payment-ready-walkthrough",
    );
    expect(WALKTHROUGH_URL).not.toContain("example.com");
  });
});
