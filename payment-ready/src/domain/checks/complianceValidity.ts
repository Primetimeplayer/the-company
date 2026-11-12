import { differenceInCalendarDays, parseISO } from "date-fns";
import { formatDate } from "@/lib/dates";
import type { CheckResult, ComplianceDoc, Project } from "../types";

const LABELS: Record<ComplianceDoc["type"], string> = {
  public_liability: "Public liability insurance",
  employers_liability: "Employers' liability insurance",
  cscs: "CSCS card register",
  rams: "RAMS pack",
  cis_verification: "CIS verification",
};

/** Rule 8: compliance documents must be valid on the submission date. */
export function complianceValidity(project: Project): CheckResult[] {
  const submissionDate = project.currentApplication.submissionDate;

  return project.complianceDocs.map((doc) => {
    const base = {
      id: `compliance:${doc.type}`,
      title: LABELS[doc.type],
      category: "compliance" as const,
      sourceDocIds: [doc.sourceDocId],
    };

    if (!doc.expiryDate) {
      return {
        ...base,
        status: "warning" as const,
        message: `${LABELS[doc.type]} for ${doc.holder} has no expiry date recorded on file.`,
        expected: `Valid on ${formatDate(submissionDate)}`,
        actual: "No expiry date recorded",
      };
    }

    const daysUntilExpiry = differenceInCalendarDays(
      parseISO(doc.expiryDate),
      parseISO(submissionDate),
    );

    if (daysUntilExpiry < 0) {
      return {
        ...base,
        status: "fail" as const,
        message: `${LABELS[doc.type]} for ${doc.holder} expired on ${formatDate(doc.expiryDate)} — ${Math.abs(daysUntilExpiry)} days before the application was submitted.`,
        expected: `Valid on ${formatDate(submissionDate)}`,
        actual: `Expired ${formatDate(doc.expiryDate)}`,
      };
    }

    if (daysUntilExpiry <= 30) {
      return {
        ...base,
        status: "warning" as const,
        message: `${LABELS[doc.type]} for ${doc.holder} is valid now but expires on ${formatDate(doc.expiryDate)}, ${daysUntilExpiry} days after submission.`,
        expected: `Valid beyond ${formatDate(submissionDate)}`,
        actual: `Expires ${formatDate(doc.expiryDate)}`,
      };
    }

    return {
      ...base,
      status: "pass" as const,
      message: `${LABELS[doc.type]} for ${doc.holder} is valid until ${formatDate(doc.expiryDate)}.`,
      expected: `Valid on ${formatDate(submissionDate)}`,
      actual: `Valid to ${formatDate(doc.expiryDate)}`,
    };
  });
}
