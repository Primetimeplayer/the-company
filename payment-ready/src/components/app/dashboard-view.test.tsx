// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DashboardView, type DashboardViewProps } from "./dashboard-view";
import { runAllChecks } from "@/domain/checks";
import { buildSummary } from "@/domain/summary";
import { sampleProject } from "@/fixtures/sample-project";

afterEach(cleanup);

function buildProps(): Omit<DashboardViewProps, "loaded" | "onSampleLoaded"> {
  const run = runAllChecks(sampleProject);
  const counts = {
    pass: run.results.filter((result) => result.status === "pass").length,
    warning: run.results.filter((result) => result.status === "warning").length,
    fail: run.results.filter((result) => result.status === "fail").length,
    missing: run.results.filter((result) => result.status === "missing").length,
  };

  return {
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
}

function Harness() {
  const [loaded, setLoaded] = useState(false);
  return (
    <DashboardView
      {...buildProps()}
      loaded={loaded}
      onSampleLoaded={() => setLoaded(true)}
    />
  );
}

describe("DashboardView", () => {
  it("hides the report and shows an empty state until the sample is loaded", () => {
    render(<Harness />);

    expect(screen.getByText("No application loaded yet")).toBeTruthy();
    expect(screen.queryByText("Readiness report")).toBeNull();
    expect(screen.queryByText("Key dates")).toBeNull();
    expect(screen.queryByText("Checks passed")).toBeNull();
    expect(screen.queryByText("Recommended next steps")).toBeNull();
  });

  it("reveals the stats, summary, report and key dates after loading", () => {
    render(<Harness />);

    fireEvent.click(screen.getAllByText("Load sample project")[0] as HTMLElement);

    expect(screen.getByText("Readiness report")).toBeTruthy();
    expect(screen.getByText("Key dates")).toBeTruthy();
    expect(screen.getByText("Checks passed")).toBeTruthy();
    expect(screen.getByText("Recommended next steps")).toBeTruthy();
  });
});
