import type { Project } from "@/domain/types";

/**
 * SAMPLE DATA — a single fabricated UK electrical subcontract.
 * Every party, document and figure below is invented for the demo.
 */
export const sampleProject: Project = {
  sampleLabel: "SAMPLE DATA",
  referenceDate: "2026-01-28",
  subcontract: {
    id: "sub-rsa-b-elec",
    projectName: "Riverside Apartments – Block B, Electrical Fit-out",
    projectRef: "RSA-B-ELEC",
    mainContractor: "Northgate Build Ltd (sample)",
    subcontractor: "Brightline Electrical Ltd (sample)",
    originalValuePence: 10_000_000,
    retentionPercent: 5,
    paymentTerms: {
      applicationDayOfMonth: 25,
      dueDateDaysAfterApplication: 7,
      paymentNoticeDaysAfterDueDate: 5,
      finalPaymentDaysAfterDueDate: 28,
      payLessNoticeDaysBeforeFinal: 7,
    },
    practicalCompletionDate: "2026-08-14",
    defectsPeriodMonths: 12,
  },

  variations: [
    {
      id: "var-01",
      ref: "V01",
      description: "Additional containment to Level 2 risers",
      valuePence: 450_000,
      status: "approved",
      signedBy: "J. Whitmore (Northgate Build Ltd)",
      signedDate: "2025-09-18",
      sourceDocId: "ev-v01",
    },
    {
      id: "var-02",
      ref: "V02",
      description: "Upgraded distribution board specification",
      valuePence: 320_000,
      status: "approved",
      signedBy: "J. Whitmore (Northgate Build Ltd)",
      signedDate: "2025-11-06",
      sourceDocId: "ev-v02",
    },
    {
      id: "var-03",
      ref: "V03",
      description: "Extra small power to apartment risers",
      valuePence: 230_000,
      status: "approved",
      sourceDocId: "ev-v03",
    },
    {
      id: "var-04",
      ref: "V04",
      description: "Temporary lighting during block handover",
      valuePence: 180_000,
      status: "pending",
      sourceDocId: "ev-v04-email",
    },
  ],

  previousApplications: [
    {
      number: 1,
      periodEnd: "2025-10-24",
      cumulativeGrossPence: 2_400_000,
      certifiedPence: 2_400_000,
      retentionHeldPence: 120_000,
      paidPence: 2_280_000,
      paidDate: "2025-11-14",
    },
    {
      number: 2,
      periodEnd: "2025-11-24",
      cumulativeGrossPence: 4_900_000,
      certifiedPence: 4_850_000,
      retentionHeldPence: 245_000,
      paidPence: 4_605_000,
      paidDate: "2025-12-12",
    },
    {
      number: 3,
      periodEnd: "2025-12-24",
      cumulativeGrossPence: 7_450_000,
      certifiedPence: 7_420_000,
      retentionHeldPence: 372_500,
      paidPence: 7_047_500,
      paidDate: "2026-01-16",
    },
  ],

  currentApplication: {
    number: 4,
    periodEnd: "2026-01-24",
    submissionDate: "2026-02-02",
    lineItems: [
      {
        ref: "L1",
        description: "Containment & trunking, Level 1",
        contractValuePence: 2_000_000,
        percentComplete: 100,
        claimedPence: 2_000_000,
      },
      {
        ref: "L2",
        description: "Small power & lighting, Level 2",
        contractValuePence: 2_400_000,
        percentComplete: 80,
        claimedPence: 1_920_000,
      },
      {
        ref: "L3",
        description: "Distribution boards & submains",
        contractValuePence: 1_800_000,
        percentComplete: 70,
        claimedPence: 1_305_000,
      },
      {
        ref: "L4",
        description: "Fire alarm containment & cabling",
        contractValuePence: 1_600_000,
        percentComplete: 45,
        claimedPence: 720_000,
      },
      {
        ref: "L5",
        description: "Fire alarm first fix",
        contractValuePence: 1_400_000,
        percentComplete: 55,
        claimedPence: 770_000,
      },
      {
        ref: "L6",
        description: "Earthing & bonding",
        contractValuePence: 800_000,
        percentComplete: 30,
        claimedPence: 240_000,
      },
    ],
    variationsClaimed: [
      { variationRef: "V01", claimedPence: 450_000 },
      { variationRef: "V02", claimedPence: 320_000 },
      { variationRef: "V03", claimedPence: 230_000 },
      { variationRef: "V04", claimedPence: 180_000 },
    ],
    cumulativeGrossPence: 8_000_000,
    retentionPence: 240_000,
    previouslyCertifiedPence: 7_600_000,
    amountDuePence: 160_000,
    sourceDocId: "ev-valuation",
  },

  complianceDocs: [
    {
      id: "comp-pl",
      type: "public_liability",
      holder: "Brightline Electrical Ltd (sample)",
      expiryDate: "2026-01-23",
      sourceDocId: "ev-pl",
    },
    {
      id: "comp-el",
      type: "employers_liability",
      holder: "Brightline Electrical Ltd (sample)",
      expiryDate: "2026-09-30",
      sourceDocId: "ev-el",
    },
    {
      id: "comp-cscs",
      type: "cscs",
      holder: "Site operatives (6 cards)",
      expiryDate: "2027-02-28",
      sourceDocId: "ev-cscs",
    },
    {
      id: "comp-cis",
      type: "cis_verification",
      holder: "Brightline Electrical Ltd (sample)",
      expiryDate: "2026-12-31",
      sourceDocId: "ev-cis",
    },
  ],

  evidenceDocs: [
    {
      id: "ev-subcontract",
      fileName: "Subcontract_RSA-B-ELEC.pdf",
      kind: "subcontract",
      linkedRefs: ["RSA-B-ELEC"],
    },
    {
      id: "ev-valuation",
      fileName: "Valuation_App04.xlsx",
      kind: "valuation",
      linkedRefs: ["APP-04"],
    },
    {
      id: "ev-prev-app",
      fileName: "Previous_Application_03.pdf",
      kind: "previous_application",
      linkedRefs: ["APP-03"],
    },
    {
      id: "ev-v01",
      fileName: "V01_signed.pdf",
      kind: "variation",
      linkedRefs: ["V01"],
    },
    {
      id: "ev-v02",
      fileName: "V02_signed.pdf",
      kind: "variation",
      linkedRefs: ["V02"],
    },
    {
      id: "ev-v03",
      fileName: "V03_draft_unsigned.pdf",
      kind: "variation",
      linkedRefs: ["V03"],
    },
    {
      id: "ev-v04-email",
      fileName: "V04_instruction_email.pdf",
      kind: "variation",
      linkedRefs: ["V04"],
    },
    {
      id: "ev-pl",
      fileName: "Public_Liability_Northgate_2025.pdf",
      kind: "insurance",
      linkedRefs: ["PL-2025"],
    },
    {
      id: "ev-el",
      fileName: "Employers_Liability_2026.pdf",
      kind: "insurance",
      linkedRefs: ["EL-2026"],
    },
    {
      id: "ev-cscs",
      fileName: "CSCS_Cards_Register.pdf",
      kind: "insurance",
      linkedRefs: ["CSCS-2026"],
    },
    {
      id: "ev-cis",
      fileName: "CIS_Verification_2026.pdf",
      kind: "insurance",
      linkedRefs: ["CIS-2026"],
    },
    {
      id: "ev-dn-1",
      fileName: "Delivery_Note_Wk02.pdf",
      kind: "delivery_note",
      linkedRefs: ["L1", "L2", "L3"],
    },
    {
      id: "ev-dn-2",
      fileName: "Delivery_Note_Wk05.pdf",
      kind: "delivery_note",
      linkedRefs: ["L4", "L5", "L6"],
    },
    {
      id: "ev-photo-l1",
      fileName: "Photo_L1_containment.jpg",
      kind: "photo",
      linkedRefs: ["L1"],
    },
    {
      id: "ev-photo-l2",
      fileName: "Photo_L2_small_power.jpg",
      kind: "photo",
      linkedRefs: ["L2"],
    },
    {
      id: "ev-photo-l3",
      fileName: "Photo_L3_boards.jpg",
      kind: "photo",
      linkedRefs: ["L3"],
    },
  ],

  clientRequirements: [
    {
      id: "cr-photos",
      mainContractor: "Northgate Build Ltd (sample)",
      rule: "photos_per_line_item",
      description:
        "Photographic evidence is required for every line item claimed above 50% complete.",
    },
    {
      id: "cr-signed",
      mainContractor: "Northgate Build Ltd (sample)",
      rule: "signed_variations_only",
      description:
        "Only variations with a signed instruction may be claimed in the application.",
    },
    {
      id: "cr-delivery",
      mainContractor: "Northgate Build Ltd (sample)",
      rule: "delivery_notes_for_materials",
      description:
        "Delivery notes are required for material line items claimed at £2,000.00 or more.",
    },
    {
      id: "cr-valuation",
      mainContractor: "Northgate Build Ltd (sample)",
      rule: "valuation_template",
      description:
        "Applications must be submitted on the Northgate valuation template.",
    },
  ],
};
