import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import type { Project } from "../types";
import { keyDates } from "./keyDates";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("keyDates", () => {
  it("runs the timetable from the contractual application date", () => {
    const { keyDates: dates } = keyDates(sampleProject);
    expect(dates.scheduledApplicationDate).toBe("2026-01-25");
    expect(dates.dueDate).toBe("2026-02-01");
    expect(dates.paymentNoticeBy).toBe("2026-02-06");
    expect(dates.payLessNoticeBy).toBe("2026-02-22");
    expect(dates.finalDateForPayment).toBe("2026-03-01");
  });

  it("does not move the timetable when the application is late", () => {
    const onTime = clone(sampleProject);
    onTime.currentApplication.submissionDate = "2026-01-25";

    const late = keyDates(sampleProject).keyDates;
    const early = keyDates(onTime).keyDates;

    expect(late.dueDate).toBe(early.dueDate);
    expect(late.paymentNoticeBy).toBe(early.paymentNoticeBy);
    expect(late.finalDateForPayment).toBe(early.finalDateForPayment);
  });

  it("projects retention releases from approved, signed variations only", () => {
    const { keyDates: dates } = keyDates(sampleProject);
    expect(dates.retentionReleases).toHaveLength(2);
    // 10,770,000 signed contract value × 5% = 538,500, split in half.
    expect(dates.retentionReleases[0]).toMatchObject({
      date: "2026-08-14",
      amountPence: 269_250,
    });
    expect(dates.retentionReleases[1]).toMatchObject({
      date: "2027-08-14",
      amountPence: 269_250,
    });
    expect(dates.retentionReleases[1]?.label).toContain("12-month defects period");
  });

  it("adds a newly signed variation to the release projection", () => {
    const project = clone(sampleProject);
    const variation = project.variations.find((item) => item.ref === "V03");
    if (!variation) throw new Error("missing V03");
    variation.signedBy = "J. Whitmore (Northgate Build Ltd)";
    variation.signedDate = "2026-01-12";

    // 11,000,000 × 5% = 550,000, split in half.
    expect(keyDates(project).keyDates.retentionReleases[0]?.amountPence).toBe(
      275_000,
    );
  });

  it("warns when the application went in late", () => {
    const { results, keyDates: dates } = keyDates(sampleProject);
    expect(dates.submissionIsLate).toBe(true);
    expect(dates.daysLate).toBe(8);
    // referenceDate 28/01/2026 → contractual due date 01/02/2026.
    expect(dates.daysUntilDueDate).toBe(4);

    const late = results.find((item) => item.id === "key-dates:late");
    expect(late?.status).toBe("warning");
    expect(late?.actual).toBe("02/02/2026 (8 days late)");
    expect(late?.message).toContain("may move these dates");
  });

  it("marks the timetable row informational", () => {
    expect(
      keyDates(sampleProject).results.find((item) => item.id === "key-dates")
        ?.informational,
    ).toBe(true);
  });

  it("does not warn when the application is on time", () => {
    const { results, keyDates: dates } = keyDates(cleanProject);
    expect(dates.submissionIsLate).toBe(false);
    expect(dates.dueDate).toBe("2026-02-01");
    expect(dates.daysUntilDueDate).toBe(5);
    expect(results.some((item) => item.id === "key-dates:late")).toBe(false);
  });

  it("warns when practical completion is not recorded", () => {
    const project: Project = clone(sampleProject);
    delete project.subcontract.practicalCompletionDate;

    const { results, keyDates: dates } = keyDates(project);
    expect(dates.retentionReleases).toHaveLength(0);
    expect(
      results.find((item) => item.id === "key-dates:retention-release")?.status,
    ).toBe("warning");
  });
});
