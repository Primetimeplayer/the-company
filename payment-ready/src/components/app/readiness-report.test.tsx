// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { ReadinessReport } from "./readiness-report";
import { runAllChecks } from "@/domain/checks";
import { sampleProject } from "@/fixtures/sample-project";

afterEach(cleanup);

function renderReport() {
  const run = runAllChecks(sampleProject);
  render(
    <ReadinessReport
      results={run.results}
      evidenceDocs={sampleProject.evidenceDocs}
    />,
  );
  return screen.getByRole("table");
}

describe("ReadinessReport", () => {
  it("sorts failing checks above everything else", () => {
    const table = renderReport();
    const rows = within(table).getAllByRole("row");

    // rows[0] is the header; the first failing check is L3.
    expect(within(rows[1] as HTMLElement).getByText("Fail")).toBeTruthy();
    expect(within(rows[1] as HTMLElement).getByText(/L3/)).toBeTruthy();
  });

  it("shows filter tabs with counts", () => {
    renderReport();

    expect(screen.getByRole("button", { name: /^All/ }).textContent).toContain(
      "29",
    );
    expect(screen.getByRole("button", { name: /^Issues/ }).textContent).toContain(
      "7",
    );
    expect(
      screen.getByRole("button", { name: /^Missing/ }).textContent,
    ).toContain("2");
    expect(screen.getByRole("button", { name: /^Passed/ }).textContent).toContain(
      "17",
    );
  });

  it("filters down to missing evidence", () => {
    const table = renderReport();

    fireEvent.click(screen.getByRole("button", { name: /^Missing/ }));

    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3); // header + 2 missing checks
    expect(within(rows[1] as HTMLElement).getByText("Missing")).toBeTruthy();
    expect(within(table).queryByText("Retention")).toBeNull();
  });

  it("filters down to passing checks", () => {
    const table = renderReport();

    fireEvent.click(screen.getByRole("button", { name: /^Passed/ }));

    expect(within(table).queryByText("Fail")).toBeNull();
    expect(within(table).queryByText("Missing")).toBeNull();
    expect(within(table).getAllByRole("row").length).toBeGreaterThan(1);
  });
});
