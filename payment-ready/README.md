# Payment Ready (demo)

A working demo of **Payment Ready** — a checking aid that reviews a UK construction
subcontractor's payment application *before* it is sent to the main contractor. It
reconciles the valuation arithmetic, checks variations and compliance documents,
flags missing evidence and works out the contractual payment timetable.

Everything in the app is driven by **one typed sample fixture**. There is no
database, no AI calls and no payments. All figures, parties and documents are
fictional.

> Payment Ready is a checking aid. It does not guarantee payment or provide legal
> advice. Sample data shown.

## Run it

```bash
cd payment-ready
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest unit + component tests
npm run build   # production build + type check
```

Requires Node 18.17+ (built and tested on Node 20 and 26).

## Password protection

`src/middleware.ts` gates the whole demo behind HTTP Basic Auth when both
`DEMO_USER` and `DEMO_PASSWORD` are set:

```bash
DEMO_USER=demo DEMO_PASSWORD='something-long' npm run build && npm start
```

In a deployment (Vercel, Railway, etc.) add them as environment variables. If
either is unset — the normal local-dev case — every request is allowed through.
Next's build output, the favicon and static assets are excluded from the matcher,
so `/_next/static/…`, `/_next/image`, `/favicon.ico` and any request with a file
extension are served without a challenge. Browsers will prompt for the password
and cache it for the session.

## What's in the demo

| Route  | What it is |
| ------ | ---------- |
| `/`    | Marketing landing page: hero, how it works, pricing note. |
| `/app` | The demo workspace. Starts empty; **Load sample project** reveals the stat cards, summary, readiness report and key-dates timeline. |

## Folder structure

```
payment-ready/
├── src/
│   ├── app/
│   │   ├── globals.css            # design tokens (pastel status colours, grid background)
│   │   ├── layout.tsx             # root layout + Inter font
│   │   ├── page.tsx               # landing page
│   │   └── app/page.tsx           # /app dashboard (server-rendered shell)
│   ├── components/
│   │   ├── app/                   # sidebar, dashboard view, stat cards, report, key dates, dropzone
│   │   ├── ui/                    # shadcn/ui primitives (button, card, table, sheet)
│   │   ├── brand.tsx
│   │   ├── footer-disclaimer.tsx
│   │   ├── mobile-menu.tsx
│   │   └── status-chip.tsx
│   ├── domain/
│   │   ├── types.ts               # domain model — money in integer pence, ISO dates
│   │   ├── money.ts               # GBP formatting, percent-of-pence rounding
│   │   ├── report.ts              # report sorting + filter tabs
│   │   ├── summary.ts             # deterministic "recommended next steps" text
│   │   └── checks/                # the rules engine (pure functions + tests)
│   ├── fixtures/
│   │   ├── sample-project.ts      # the sample project (contains the planted errors)
│   │   └── clean-project.ts       # corrected variant used by tests
│   └── lib/                       # dates (date-fns), config, `cn` class merge
```

## The sample project

- **Project:** Riverside Apartments – Block B, Electrical Fit-out (`RSA-B-ELEC`)
- **Main contractor:** Northgate Build Ltd (sample)
- **Subcontractor:** Brightline Electrical Ltd (sample)
- **Subcontract value:** £100,000.00, 5% retention, no retention cap
- **Terms:** applications on the 25th, due 7 days after the contractual application
  date, payment notice within 5 days, final date for payment 28 days after the due
  date, pay-less notice 7 days before that.

### Planted errors

| # | Where | Issue |
| - | ----- | ----- |
| 1 | `currentApplication.lineItems` L3 | Claimed £13,050.00 but 70% of £18,000.00 is £12,600.00 — £450.00 over-claimed. |
| 2 | `currentApplication.cumulativeGrossPence` | Stated £80,000.00; line items (£69,550.00) + variation claims (£11,800.00) = £81,350.00. |
| 3 | `currentApplication.retentionPence` | Calculated at 3% (£2,400.00) instead of 5%; the corrected figure is £4,067.50. |
| 4 | `currentApplication.previouslyCertifiedPence` | Stated £76,000.00; application #3 was certified at £74,200.00. |
| 5 | Variation `V03` | Approved but never signed, claimed anyway. |
| 6 | Variation `V04` | Still pending, claimed anyway. |
| 7 | `complianceDocs` public liability | Expired 17/01/2026 — 10 days before the 27/01/2026 submission. |
| 8 | `complianceDocs` | No RAMS pack on file (all five compliance types are required). |
| 9 | Evidence `L5` | Fire alarm first fix is 55% complete but has no photo, against Northgate's photo rule. |
| 10 | `currentApplication.amountDuePence` | Arithmetically consistent with the stated figures (£1,600.00) but the corrected figures give £3,082.50 — reported as a warning. |
| 11 | Submission date | Sent 27/01/2026, 2 days after the contractual 25/01/2026 application date (warning). |

`clean-project.ts` fixes all of the above (including adding the RAMS pack and signing
V03/V04) so the test suite can prove every scored check reaches a pass.

### Current demo result

The sample scores **15 of 26 scored checks** (29 rows in total). Three rows are
**informational** reference output — the revised contract value, the payment
timetable and the signed-variations client-rule summary — and are excluded from the
score.

## Rules engine

`runAllChecks(project)` returns `{ results, score: { passed, total }, keyDates }`.
Every check is a pure, deterministic function returning `CheckResult[]` with a
plain-English message, `expected`/`actual` where useful, and source document IDs.
No AI is used anywhere; the summary card on `/app` is generated from the failing
check IDs by `buildSummary()`.

| Check | What it enforces |
| ----- | ---------------- |
| `lineItemMaths` | Claimed = contract value × % complete, rounded to the penny; percent complete must be 0–100. |
| `revisedContractValue` | Original + approved variations (informational). |
| `cumulativeTotal` | Cumulative gross = line items + variation claims. |
| `retention` | Contract rate on the stated gross **and** on the corrected gross, with any cap applied to the revised signed contract value. |
| `previouslyCertified` | Matches the last previous application's certified figure. |
| `amountDue` | Internal arithmetic first; then the corrected cumulative gross − corrected retention − last certified. A difference against the corrected figure is a warning. |
| `variationsClaimable` | Each claim exists, is not above the variation value, is approved, and (per the client rule) signed. |
| `complianceValidity` | Every required document is on file (missing otherwise) and valid on the submission date; expiry within 30 days warns. |
| `evidenceRequirements` | Photos for line items above 50%, signed variations, delivery notes for materials ≥ £2,000, client valuation template. |
| `keyDates` | Contractual application date, due date, payment notice, pay-less deadline, final date, retention releases and late-submission warning (informational + warning). |

Payment dates run from the **contractual** application date, so a late application
does not quietly move the client's deadlines; the late-submission warning says the
dates may move.

## Tests

`npm test` runs **108 tests** across 22 files, covering:

- each rule and every planted error
- the clean fixture passing all 25 scored checks
- date clamping (day 31 in February never rolls into March)
- corrected retention / amount due arithmetic and the retention cap
- fixture consistency (previous applications paid = certified − retention)
- report sorting/filtering, the deterministic summary wording, the sidebar counts,
  the dashboard empty state and the landing-page mobile menu
- the walkthrough CTAs pointing at the booking URL and opening in a new tab
- the Basic Auth middleware: pass-through when unconfigured, 401 challenge, wrong
  or malformed credentials, and the static-asset exclusions

## Scope notes

Deliberately **not** included: accounts or per-user login, database, Stripe, real
document extraction, portal integrations. The optional HTTP Basic Auth gate above
is the only access control. The upload dropzone is visual only — selected files are listed
but never sent anywhere.
