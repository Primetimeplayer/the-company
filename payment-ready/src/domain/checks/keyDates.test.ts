import { describe, expect, it } from "vitest";
import { cleanProject } from "@/fixtures/clean-project";
import { sampleProject } from "@/fixtures/sample-project";
import { keyDates } from "./keyDates";

describe("keyDates", () => {
  it("derives the payment timetable from the terms and submission date", () => {
    const { keyDates: dates } = keyDates(sampleProject);
    expect(dates.scheduledApplicationDate).toBe("2026-01-25");
    expect(dates.dueDate).toBe("2026-02-09");
    expect(dates.paymentNoticeBy).toBe("2026-02-14");
    expect(dates.payLessNoticeBy).toBe("2026-03-02");
    expect(dates.finalDateForPayment).toBe("2026-03-09");
  });

  it("projects both retention releases", () => {
    const { keyDates: dates } = keyDates(sampleProject);
    expect(dates.retentionReleases).toHaveLength(2);
    expect(dates.retentionReleases[0]).toMatchObject({
      date: "2026-08-14",
      amountPence: 250_000,
    });
    expect(dates.retentionReleases[1]).toMatchObject({
      date: "2027-08-14",
      amountPence: 250_000,
    });
    expect(dates.retentionReleases[1]?.label).toContain("12-month defects period");
  });

  it("warns when the application went in late", () => {
    const { results, keyDates: dates } = keyDates(sampleProject);
    expect(dates.submissionIsLate).toBe(true);
    expect(dates.daysLate).toBe(8);
    expect(dates.daysUntilDueDate).toBe(4);

    const late = results.find((result) => result.id === "key-dates:late");
    expect(late?.status).toBe("warning");
    expect(late?.actual).toBe("02/02/2026 (8 days late)");
  });

  it("does not warn when the application is on time", () => {
    const { results, keyDates: dates } = keyDates(cleanProject);
    expect(dates.submissionIsLate).toBe(false);
    expect(dates.dueDate).toBe("2026-02-01");
    expect(dates.daysUntilDueDate).toBe(5);
    expect(results.some((result) => result.id === "key-dates:late")).toBe(false);
  });

  it("warns when practical completion is not recorded", () => {
    const project = JSON.parse(JSON.stringify(sampleProject));
    delete project.subcontract.practicalCompletionDate;

    const { results, keyDates: dates } = keyDates(project);
    expect(dates.retentionReleases).toHaveLength(0);
    expect(
      results.find((result) => result.id === "key-dates:retention-release")?.status,
    ).toBe("warning");
  });
});
