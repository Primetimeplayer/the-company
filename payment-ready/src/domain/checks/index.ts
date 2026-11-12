import type { Project, ProjectCheckRun } from "../types";
import { amountDue } from "./amountDue";
import { complianceValidity } from "./complianceValidity";
import { cumulativeTotal } from "./cumulativeTotal";
import { evidenceRequirements } from "./evidenceRequirements";
import { keyDates } from "./keyDates";
import { lineItemMaths } from "./lineItemMaths";
import { previouslyCertified } from "./previouslyCertified";
import { retention } from "./retention";
import { revisedContractValue } from "./revisedContractValue";
import { variationsClaimable } from "./variationsClaimable";

export {
  amountDue,
  complianceValidity,
  cumulativeTotal,
  evidenceRequirements,
  keyDates,
  lineItemMaths,
  previouslyCertified,
  retention,
  revisedContractValue,
  variationsClaimable,
};

/**
 * Run every rule and score the application. Pure and deterministic.
 * Informational rows (reference figures and the timetable) are reported but do
 * not count towards the score.
 */
export function runAllChecks(project: Project): ProjectCheckRun {
  const dates = keyDates(project);

  const results = [
    ...revisedContractValue(project),
    ...lineItemMaths(project),
    ...cumulativeTotal(project),
    ...retention(project),
    ...previouslyCertified(project),
    ...amountDue(project),
    ...variationsClaimable(project),
    ...complianceValidity(project),
    ...evidenceRequirements(project),
    ...dates.results,
  ];

  const scored = results.filter((result) => !result.informational);

  return {
    results,
    score: {
      passed: scored.filter((result) => result.status === "pass").length,
      total: scored.length,
    },
    keyDates: dates.keyDates,
  };
}
