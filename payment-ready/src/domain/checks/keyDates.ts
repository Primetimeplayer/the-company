import { addDaysISO, addMonthsISO, applicationDateForPeriod, daysBetweenISO, formatDate } from "@/lib/dates";
import type { CheckResult, KeyDates, Project } from "../types";
import { expectedRetentionPence, revisedContractValuePence } from "./shared";

export interface KeyDatesCheck {
  results: CheckResult[];
  keyDates: KeyDates;
}

/**
 * Rule 10: derive the payment timetable from the contract terms and the
 * submission date, and warn when the application went in late.
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
    application.submissionDate,
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
    revisedContractValuePence(project),
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
      title: "Payment timetable",
      category: "deadlines",
      status: "pass",
      message: `Application #${application.number} is due for payment on ${formatDate(dueDate)}. Payment notice expected by ${formatDate(paymentNoticeBy)}, pay-less notice no later than ${formatDate(payLessNoticeBy)}, final date for payment ${formatDate(finalDateForPayment)}.`,
      expected: `Application date ${formatDate(scheduledApplicationDate)}`,
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
      message: `Submitted on ${formatDate(application.submissionDate)}, ${daysLate} day${daysLate === 1 ? "" : "s"} after the contractual application date of ${formatDate(scheduledApplicationDate)}. A late application can delay the payment notice and push back the final date for payment.`,
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
