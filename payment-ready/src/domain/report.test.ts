import { describe, expect, it } from "vitest";
import {
  countByFilter,
  filterCheckResults,
  sortCheckResults,
} from "./report";
import type { CheckResult, CheckStatus } from "./types";

function result(id: string, status: CheckStatus): CheckResult {
  return {
    id,
    title: id,
    category: "money",
    status,
    message: `${id} is ${status}`,
    sourceDocIds: ["ev-valuation"],
  };
}

describe("sortCheckResults", () => {
  it("orders fail, missing, warning, pass", () => {
    const sorted = sortCheckResults([
      result("pass-1", "pass"),
      result("warning-1", "warning"),
      result("fail-1", "fail"),
      result("missing-1", "missing"),
    ]);

    expect(sorted.map((item) => item.id)).toEqual([
      "fail-1",
      "missing-1",
      "warning-1",
      "pass-1",
    ]);
  });

  it("keeps the original order within a status", () => {
    const sorted = sortCheckResults([
      result("fail-b", "fail"),
      result("fail-a", "fail"),
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["fail-b", "fail-a"]);
  });

  it("does not mutate the input", () => {
    const input = [result("pass-1", "pass"), result("fail-1", "fail")];
    sortCheckResults(input);
    expect(input[0]?.id).toBe("pass-1");
  });
});

describe("filterCheckResults", () => {
  const results = [
    result("fail-1", "fail"),
    result("fail-2", "fail"),
    result("missing-1", "missing"),
    result("warning-1", "warning"),
    result("pass-1", "pass"),
  ];

  it("shows everything on All", () => {
    expect(filterCheckResults(results, "all")).toHaveLength(5);
    expect(countByFilter(results, "all")).toBe(5);
  });

  it("shows only failing checks on Issues", () => {
    expect(filterCheckResults(results, "issues").map((item) => item.id)).toEqual([
      "fail-1",
      "fail-2",
    ]);
    expect(countByFilter(results, "issues")).toBe(2);
  });

  it("shows only missing evidence on Missing", () => {
    expect(filterCheckResults(results, "missing").map((item) => item.id)).toEqual([
      "missing-1",
    ]);
  });

  it("shows only passing checks on Passed", () => {
    expect(filterCheckResults(results, "passed").map((item) => item.id)).toEqual([
      "pass-1",
    ]);
    expect(countByFilter(results, "passed")).toBe(1);
  });
});
