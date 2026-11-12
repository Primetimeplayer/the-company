# Payment Ready (demo)

A working demo of **Payment Ready** — a checking aid that reviews a UK construction
subcontractor's payment application *before* it is sent to the main contractor. It
reconciles the valuation arithmetic, checks variations and compliance documents,
flags missing evidence and works out the payment timetable.

Everything in the app is driven by **one typed sample fixture**. There is no
database, no auth, no AI calls and no payments. All figures, parties and documents
are fictional.

> Payment Ready is a checking aid. It does not guarantee payment or provide legal
> advice. Sample data shown.

## Run it

```bash
cd payment-ready
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest unit tests
npm run build   # production build + type check
```

Requires Node 18.17+ (built and tested on Node 20).

## What's in the demo

| Route  | What it is |
| ------ | ---------- |
| `/`    | Marketing landing page: hero, how it works, pricing note. |
| `/app` | The demo workspace: upload dropzone (visual only), stat cards, readiness report with a detail side sheet, and the key-dates timeline. |

## Folder structure

```
payment-ready/
├── src/
│   ├── app/
│   │   ├── globals.css            # design tokens (pastel status colours, grid background)
│   │   ├── layout.tsx             # root layout + Inter font
│   │   ├── page.tsx               # landing page
│   │   └── app/page.tsx           # /app dashboard
│   ├── components/
│   │   ├── app/                   # sidebar, stat cards, report table, sheet, key dates, dropzone
│   │   ├── ui/                    # shadcn/ui primitives (button, card, table, sheet)
│   │   ├── brand.tsx
│   │   ├── footer-disclaimer.tsx
│   │   └── status-chip.tsx
│   ├── domain/
│   │   ├── types.ts               # domain model — money in integer pence, ISO dates
│   │   ├── money.ts               # GBP formatting, percent-of-pence rounding
│   │   ├── summary.ts             # deterministic "recommended next steps" text
│   │   └── checks/                # the rules engine (pure functions + tests)
│   │       ├── lineItemMaths.ts
│   │       ├── revisedContractValue.ts
│   │       ├── cumulativeTotal.ts
│   │       ├── retention.ts
│   │       ├── previouslyCertified.ts
│   │       ├── amountDue.ts
│   │       ├── variationsClaimable.ts
│   │       ├── complianceValidity.ts
│   │       ├── evidenceRequirements.ts
│   │       ├── keyDates.ts
│   │       ├── index.ts           # runAllChecks(project)
│   │       └── *.test.ts
│   ├── fixtures/
│   │   ├── sample-project.ts      # the sample project (contains the planted errors)
│   │   └── clean-project.ts       # corrected variant used by tests
│   └── lib/                       # dates (date-fns), `cn` class merge
```

## The sample project

- **Project:** Riverside Apartments – Block B, Electrical Fit-out (`RSA-B-ELEC`)
- **Main contractor:** Northgate Build Ltd (sample)
- **Subcontractor:** Brightline Electrical Ltd (sample)
- **Subcontract value:** £100,000.00, 5% retention (capped at 5% of the subcontract value)
- **Terms:** applications on the 25th, due 7 days later, payment notice within 5 days,
  final date for payment 28 days after the due date, pay-less notice 7 days before that.

### Planted errors

| # | Where | Issue |
| - | ----- | ----- |
| 1 | `currentApplication.lineItems` L3 | Claimed £13,050.00 but 70% of £18,000.00 is £12,600.00 — £450.00 over-claimed. |
| 2 | `currentApplication.cumulativeGrossPence` | Stated £80,000.00; line items (£69,550.00) + variation claims (£11,800.00) = £81,350.00. |
| 3 | `currentApplication.retentionPence` | Calculated at 3% (£2,400.00) instead of the contractual 5% (£4,000.00). |
| 4 | `currentApplication.previouslyCertifiedPence` | Stated £76,000.00; application #3 was certified at £74,200.00. |
| 5 | Variation `V03` | Approved but never signed, claimed anyway. |
| 6 | Variation `V04` | Still pending, claimed anyway. |
| 7 | `complianceDocs` public liability | Expired 23/01/2026 — 10 days before the 02/02/2026 submission. |
| 8 | Evidence `L5` | Fire alarm first fix is 55% complete but has no photo, against Northgate's photo rule. |
| 9 | Submission date | Sent 02/02/2026, 8 days after the contractual 25/01/2026 application date (warning). |

`clean-project.ts` fixes all of the above so the test suite can prove every check
can reach a pass. `npm test` runs 53 tests, including one proving each planted error
is caught and one proving the clean fixture passes all 27 checks.

## Rules engine

`runAllChecks(project)` returns `{ results, score: { passed, total }, keyDates }`.
Every check is a pure, deterministic function returning `CheckResult[]` with a
plain-English message, `expected`/`actual` where useful, and the source document IDs.
No AI is used anywhere; the summary card on `/app` is generated from the failing
check IDs by `buildSummary()`.

## Scope notes

Deliberately **not** included: login, database, Stripe, real document extraction,
portal integrations. The upload dropzone is visual only — selected files are listed
but never sent anywhere.
