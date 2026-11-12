import { describe, expect, it } from "vitest";
import { applicationDateForPeriod } from "./dates";

describe("applicationDateForPeriod", () => {
  it("uses the application day later in the same month", () => {
    expect(applicationDateForPeriod("2026-01-24", 25)).toBe("2026-01-25");
  });

  it("rolls to the next month when the day has already passed", () => {
    expect(applicationDateForPeriod("2026-01-31", 25)).toBe("2026-02-25");
  });

  it("clamps day 31 to the last day of February", () => {
    expect(applicationDateForPeriod("2026-02-20", 31)).toBe("2026-02-28");
  });

  it("clamps day 31 to 29 February in a leap year", () => {
    expect(applicationDateForPeriod("2024-02-10", 31)).toBe("2024-02-29");
  });

  it("never rolls into March when clamping", () => {
    expect(applicationDateForPeriod("2026-02-01", 31).startsWith("2026-02")).toBe(
      true,
    );
  });

  it("returns the period end date when it already falls on the application day", () => {
    expect(applicationDateForPeriod("2026-01-25", 25)).toBe("2026-01-25");
  });

  it("handles a 30-day month", () => {
    expect(applicationDateForPeriod("2026-04-28", 31)).toBe("2026-04-30");
  });
});
