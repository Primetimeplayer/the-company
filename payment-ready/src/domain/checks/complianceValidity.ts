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

/** Every compliance type the client expects on file. */
const REQUIRED_TYPES: ComplianceDoc["type"][] = [
  "public_liability",
  "employers_liability",
  "cscs",
  "rams",
  "cis_verification",
];

/**
 * Rule 8: every required compliance document must be on file and valid on the
 * submission date. Documents expiring within 30 days are a warning; a required
 * document with nothing on file is 'missing'.
 */
export function complianceValidity(project: Project): CheckResult[] {
  const submissionDate = project.currentApplication.submissionDate;

  return REQUIRED_TYPES.map((type) => {
    const base = {
      id: `compliance:${type}`,
      title: LABELS[type],
      category: "compliance" as const,
    };
    const doc = project.complianceDocs.find((candidate) => candidate.type === type);

    if (!doc) {
      return {
        ...base,
        status: "missing" as const,
        message: `No ${LABELS[type]} is on file for ${project.subcontract.subcontractor}. ${project.subcontract.mainContractor} requires it before an application can be certified.`,
        expected: `Valid on ${formatDate(submissionDate)}`,
        actual: "Not on file",
        sourceDocIds: [project.currentApplication.sourceDocId],
      };
    }

    const withSource = { ...base, sourceDocIds: [doc.sourceDocId] };

    if (!doc.expiryDate) {
      return {
        ...withSource,
        status: "warning" as const,
        message: `${LABELS[type]} for ${doc.holder} has no expiry date recorded on file.`,
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
        ...withSource,
        status: "fail" as const,
        message: `${LABELS[type]} for ${doc.holder} expired on ${formatDate(doc.expiryDate)} — ${Math.abs(daysUntilExpiry)} days before the application was submitted.`,
        expected: `Valid on ${formatDate(submissionDate)}`,
        actual: `Expired ${formatDate(doc.expiryDate)}`,
      };
    }

    if (daysUntilExpiry <= 30) {
      return {
        ...withSource,
        status: "warning" as const,
        message: `${LABELS[type]} for ${doc.holder} is valid now but expires on ${formatDate(doc.expiryDate)}, ${daysUntilExpiry} days after submission.`,
        expected: `Valid beyond ${formatDate(submissionDate)}`,
        actual: `Expires ${formatDate(doc.expiryDate)}`,
      };
    }

    return {
      ...withSource,
      status: "pass" as const,
      message: `${LABELS[type]} for ${doc.holder} is valid until ${formatDate(doc.expiryDate)}.`,
      expected: `Valid on ${formatDate(submissionDate)}`,
      actual: `Valid to ${formatDate(doc.expiryDate)}`,
    };
  });
}
