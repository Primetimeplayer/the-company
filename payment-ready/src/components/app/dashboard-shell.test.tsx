// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { Counts } from "./app-sidebar";
import { DashboardShell } from "./dashboard-shell";
import type { DashboardViewProps } from "./dashboard-view";
import { runAllChecks } from "@/domain/checks";
import { buildSummary } from "@/domain/summary";
import { sampleProject } from "@/fixtures/sample-project";

afterEach(cleanup);

const run = runAllChecks(sampleProject);
const scored = run.results.filter((result) => !result.informational);

const counts: Counts = {
  pass: scored.filter((result) => result.status === "pass").length,
  warning: scored.filter((result) => result.status === "warning").length,
  fail: scored.filter((result) => result.status === "fail").length,
  missing: scored.filter((result) => result.status === "missing").length,
};

const dashboard: Omit<DashboardViewProps, "loaded" | "onSampleLoaded"> = {
  score: run.score,
  issues: counts.fail,
  missing: counts.missing,
  daysUntilDue: run.keyDates.daysUntilDueDate,
  dueDateLabel: "Contractual due date 01/02/2026",
  summary: buildSummary(run.results),
  results: run.results,
  evidenceDocs: sampleProject.evidenceDocs,
  keyDates: run.keyDates,
  paymentTerms: sampleProject.subcontract.paymentTerms,
  submissionDate: sampleProject.currentApplication.submissionDate,
};

function renderShell() {
  render(
    <DashboardShell
      counts={counts}
      header={<h1>Riverside Apartments</h1>}
      dashboard={dashboard}
    />,
  );
  return screen.getByRole("complementary");
}

describe("DashboardShell", () => {
  it("counts only scored results so the sidebar matches the score", () => {
    const sidebar = renderShell();

    fireEvent.click(screen.getAllByText("Load sample project")[0] as HTMLElement);

    expect(within(sidebar).getByText("15")).toBeTruthy();
    expect(within(sidebar).getByText("7")).toBeTruthy();
    expect(within(sidebar).getAllByText("2")).toHaveLength(2);
    // The three informational rows must not leak into any count.
    expect(within(sidebar).queryByText("29")).toBeNull();
    expect(within(sidebar).queryByText("17")).toBeNull();
  });

  it("shows placeholders instead of counts before the sample is loaded", () => {
    const sidebar = renderShell();

    expect(within(sidebar).getAllByText("—")).toHaveLength(4);
    expect(within(sidebar).queryByText("15")).toBeNull();
    expect(screen.getByText("No application loaded yet")).toBeTruthy();

    fireEvent.click(screen.getAllByText("Load sample project")[0] as HTMLElement);

    expect(within(sidebar).queryAllByText("—")).toHaveLength(0);
    expect(within(sidebar).getByText("15")).toBeTruthy();
  });
});
