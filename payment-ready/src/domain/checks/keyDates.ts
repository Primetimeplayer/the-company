import { addDaysISO, addMonthsISO, applicationDateForPeriod, daysBetweenISO, formatDate } from "@/lib/dates";
import type { CheckResult, KeyDates, Project } from "../types";
import {
  expectedRetentionPence,
  revisedSignedContractValuePence,
} from "./shared";

export interface KeyDatesCheck {
  results: CheckResult[];
  keyDates: KeyDates;
}

/**
 * Rule 10: derive the contractual payment timetable from the contract terms and
 * the contractual application date, then warn if the application went in late.
 *
 * The timetable runs from the date the application was contractually due, not
 * from the day it was actually submitted, so a late application does not quietly
 * move the client's deadlines.
 */
export function keyDates(project: Project): KeyDatesCheck {
  const { paymentTerms, practicalCompletionDate, defectsPeriodMonths } =
    project.subcontract;
  const application = project.currentApplication;

  const scheduledApplicationDate = applicationDateForPeriod(
    application.periodEnd,
    paymentTerms.applicationDayOfMonth,
  );
  const dueDate = addDaysISO(
    scheduledApplicationDate,
    paymentTerms.dueDateDaysAfterApplication,
  );
  const paymentNoticeBy = addDaysISO(
    dueDate,
    paymentTerms.paymentNoticeDaysAfterDueDate,
  );
  const finalDateForPayment = addDaysISO(
    dueDate,
    paymentTerms.finalPaymentDaysAfterDueDate,
  );
  const payLessNoticeBy = addDaysISO(
    finalDateForPayment,
    -paymentTerms.payLessNoticeDaysBeforeFinal,
  );

  const retentionTotalPence = expectedRetentionPence(
    project,
    revisedSignedContractValuePence(project),
  );
  const firstReleasePence = Math.round(retentionTotalPence / 2);
  const secondReleasePence = retentionTotalPence - firstReleasePence;

  const retentionReleases = practicalCompletionDate
    ? [
        {
          label: "Retention release — practical completion (50%)",
          date: practicalCompletionDate,
          amountPence: firstReleasePence,
        },
        {
          label: `Retention release — end of ${defectsPeriodMonths}-month defects period (50%)`,
          date: addMonthsISO(practicalCompletionDate, defectsPeriodMonths),
          amountPence: secondReleasePence,
        },
      ]
    : [];

  const daysLate = daysBetweenISO(
    scheduledApplicationDate,
    application.submissionDate,
  );
  const submissionIsLate = daysLate > 0;

  const keyDates: KeyDates = {
    scheduledApplicationDate,
    dueDate,
    paymentNoticeBy,
    payLessNoticeBy,
    finalDateForPayment,
    retentionReleases,
    daysUntilDueDate: daysBetweenISO(project.referenceDate, dueDate),
    submissionIsLate,
    daysLate: Math.max(daysLate, 0),
  };

  const results: CheckResult[] = [
    {
      id: "key-dates",
      title: "Contractual payment timetable",
      category: "deadlines",
      status: "pass",
      informational: true,
      message: `Contractual application date ${formatDate(scheduledApplicationDate)}. Sum due ${formatDate(dueDate)}, payment notice expected by ${formatDate(paymentNoticeBy)}, pay-less notice no later than ${formatDate(payLessNoticeBy)}, final date for payment ${formatDate(finalDateForPayment)}.`,
      expected: `Contractual application date ${formatDate(scheduledApplicationDate)}`,
      actual: `Submitted ${formatDate(application.submissionDate)}`,
      sourceDocIds: ["ev-subcontract"],
    },
  ];

  if (submissionIsLate) {
    results.push({
      id: "key-dates:late",
      title: "Late application",
      category: "deadlines",
      status: "warning",
      message: `Submitted on ${formatDate(application.submissionDate)}, ${daysLate} day${daysLate === 1 ? "" : "s"} after the contractual application date of ${formatDate(scheduledApplicationDate)}. A late application may move these dates and delay the payment notice, so confirm the timetable with ${project.subcontract.mainContractor}.`,
      expected: `On or before ${formatDate(scheduledApplicationDate)}`,
      actual: `${formatDate(application.submissionDate)} (${daysLate} day${daysLate === 1 ? "" : "s"} late)`,
      sourceDocIds: ["ev-subcontract"],
    });
  }

  if (!practicalCompletionDate) {
    results.push({
      id: "key-dates:retention-release",
      title: "Retention release dates",
      category: "deadlines",
      status: "warning",
      message:
        "No practical completion date is recorded, so retention release dates cannot be projected.",
      sourceDocIds: ["ev-subcontract"],
    });
  }

  return { results, keyDates };
}
