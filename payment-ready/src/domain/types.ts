/**
 * Domain model for Payment Ready.
 *
 * All monetary values are integer pence (`number`). Never floats, never pounds.
 * All dates are ISO calendar strings (yyyy-MM-dd).
 */

export type ISODateString = string;

export interface PaymentTerms {
  /** Day of the month applications fall due, e.g. 25. */
  applicationDayOfMonth: number;
  /** Days after the application date that the sum becomes due. */
  dueDateDaysAfterApplication: number;
  /** Days after the due date by which the payment notice is expected. */
  paymentNoticeDaysAfterDueDate: number;
  /** Days after the due date that form the final date for payment. */
  finalPaymentDaysAfterDueDate: number;
  /** Pay-less notice must arrive no later than this many days before the final date. */
  payLessNoticeDaysBeforeFinal: number;
}

export interface Subcontract {
  id: string;
  projectName: string;
  projectRef: string;
  mainContractor: string;
  subcontractor: string;
  originalValuePence: number;
  retentionPercent: number;
  retentionCapPercent?: number;
  paymentTerms: PaymentTerms;
  practicalCompletionDate?: ISODateString;
  defectsPeriodMonths: number;
}

export type VariationStatus = "approved" | "pending" | "rejected";

export interface Variation {
  id: string;
  ref: string;
  description: string;
  valuePence: number;
  status: VariationStatus;
  signedBy?: string;
  signedDate?: ISODateString;
  sourceDocId: string;
}

export interface PreviousApplication {
  number: number;
  periodEnd: ISODateString;
  cumulativeGrossPence: number;
  certifiedPence: number;
  retentionHeldPence: number;
  paidPence: number;
  paidDate?: ISODateString;
}

export interface LineItem {
  ref: string;
  description: string;
  contractValuePence: number;
  /** 0–100. */
  percentComplete: number;
  claimedPence: number;
}

export interface VariationClaim {
  variationRef: string;
  claimedPence: number;
}

export interface CurrentApplication {
  number: number;
  periodEnd: ISODateString;
  submissionDate: ISODateString;
  lineItems: LineItem[];
  variationsClaimed: VariationClaim[];
  cumulativeGrossPence: number;
  retentionPence: number;
  previouslyCertifiedPence: number;
  amountDuePence: number;
  sourceDocId: string;
}

export type ComplianceDocType =
  | "public_liability"
  | "employers_liability"
  | "cscs"
  | "rams"
  | "cis_verification";

export interface ComplianceDoc {
  id: string;
  type: ComplianceDocType;
  holder: string;
  expiryDate?: ISODateString;
  sourceDocId: string;
}

export type EvidenceKind =
  | "subcontract"
  | "variation"
  | "valuation"
  | "previous_application"
  | "insurance"
  | "photo"
  | "delivery_note"
  | "timesheet";

export interface EvidenceDoc {
  id: string;
  fileName: string;
  kind: EvidenceKind;
  /** Line item refs, variation refs or document refs this file supports. */
  linkedRefs: string[];
}

export type ClientRule =
  | "photos_per_line_item"
  | "signed_variations_only"
  | "delivery_notes_for_materials"
  | "valuation_template";

export interface ClientRequirement {
  id: string;
  mainContractor: string;
  rule: ClientRule;
  description: string;
}

export type CheckCategory =
  | "money"
  | "variations"
  | "compliance"
  | "evidence"
  | "deadlines";

export type CheckStatus = "pass" | "fail" | "missing" | "warning";

export interface CheckResult {
  id: string;
  title: string;
  category: CheckCategory;
  status: CheckStatus;
  message: string;
  expected?: string;
  actual?: string;
  sourceDocIds: string[];
}

export interface CheckScore {
  passed: number;
  total: number;
}

export interface RetentionRelease {
  label: string;
  date: ISODateString;
  amountPence: number;
}

export interface KeyDates {
  scheduledApplicationDate: ISODateString;
  dueDate: ISODateString;
  paymentNoticeBy: ISODateString;
  payLessNoticeBy: ISODateString;
  finalDateForPayment: ISODateString;
  retentionReleases: RetentionRelease[];
  /** Whole days from the project reference date to the due date. */
  daysUntilDueDate: number;
  submissionIsLate: boolean;
  daysLate: number;
}

/** The full bundle the rules engine needs. All demo data is a plain fixture. */
export interface Project {
  /** Always "SAMPLE DATA" for the fixtures in this demo. */
  sampleLabel: string;
  /** The "today" the demo is rendered against. */
  referenceDate: ISODateString;
  subcontract: Subcontract;
  variations: Variation[];
  previousApplications: PreviousApplication[];
  currentApplication: CurrentApplication;
  complianceDocs: ComplianceDoc[];
  evidenceDocs: EvidenceDoc[];
  clientRequirements: ClientRequirement[];
}

export interface ProjectCheckRun {
  results: CheckResult[];
  score: CheckScore;
  keyDates: KeyDates;
}
