import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { KeyDates, PaymentTerms } from "@/domain/types";
import { formatDate } from "@/lib/dates";
import { formatGBP } from "@/domain/money";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "warning" | "pass";

const DOT_CLASSES: Record<Tone, string> = {
  neutral: "bg-brand-from",
  warning: "bg-[#F59E0B]",
  pass: "bg-[#22C55E]",
};

export function KeyDatesPanel({
  keyDates,
  paymentTerms,
  submissionDate,
}: {
  keyDates: KeyDates;
  paymentTerms: PaymentTerms;
  submissionDate: string;
}) {
  const daysUntilDue = keyDates.daysUntilDueDate;

  const items: { label: string; date: string; meta: string; tone: Tone }[] = [
    {
      label: "Application submitted",
      date: formatDate(submissionDate),
      meta: keyDates.submissionIsLate
        ? `Contractual application date ${formatDate(keyDates.scheduledApplicationDate)} — ${keyDates.daysLate} day${keyDates.daysLate === 1 ? "" : "s"} late`
        : "On the contractual application date",
      tone: keyDates.submissionIsLate ? "warning" : "pass",
    },
    {
      label: "Contractual due date",
      date: formatDate(keyDates.dueDate),
      meta:
        daysUntilDue >= 0
          ? `In ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`
          : `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"} ago`,
      tone: "neutral",
    },
    {
      label: "Payment notice expected by",
      date: formatDate(keyDates.paymentNoticeBy),
      meta: `Within ${paymentTerms.paymentNoticeDaysAfterDueDate} days of the due date`,
      tone: "neutral",
    },
    {
      label: "Pay-less notice deadline",
      date: formatDate(keyDates.payLessNoticeBy),
      meta: `No later than ${paymentTerms.payLessNoticeDaysBeforeFinal} days before the final date`,
      tone: "neutral",
    },
    {
      label: "Final date for payment",
      date: formatDate(keyDates.finalDateForPayment),
      meta: `${paymentTerms.finalPaymentDaysAfterDueDate} days after the due date`,
      tone: "neutral",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-brand-indigo" aria-hidden />
          Key dates
        </CardTitle>
        <CardDescription>
          Contractual dates from the subcontract terms and the application date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="ml-1 space-y-5 border-l border-slate-200 pl-5">
          {items.map((item) => (
            <li key={item.label} className="relative">
              <span
                className={cn(
                  "absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white",
                  DOT_CLASSES[item.tone],
                )}
                aria-hidden
              />
              <p className="text-[12.5px] font-medium text-slate-900">
                {item.label}
              </p>
              <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-slate-800">
                {item.date}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                {item.meta}
              </p>
            </li>
          ))}
        </ol>

        {keyDates.retentionReleases.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Retention releases
            </p>
            <ul className="mt-3 space-y-3">
              {keyDates.retentionReleases.map((release) => (
                <li
                  key={release.label}
                  className="rounded-lg border border-border bg-slate-50/60 p-3"
                >
                  <p className="text-[12px] font-medium leading-snug text-slate-800">
                    {release.label}
                  </p>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <span className="text-[12px] tabular-nums text-slate-600">
                      {formatDate(release.date)}
                    </span>
                    <span className="text-[12px] font-semibold tabular-nums text-slate-900">
                      {formatGBP(release.amountPence)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-5 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
          These dates are contractual and run from the application date in the
          subcontract. A late application may move them — confirm the timetable
          with {""}
          the main contractor.
        </p>

        <div className="mt-4 rounded-lg bg-indigo-50/70 p-3">
          <p className="text-[12px] font-semibold text-brand-indigo">
            {daysUntilDue >= 0
              ? `${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"} until the contractual due date`
              : `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"} past the contractual due date`}
          </p>
          <p className="mt-0.5 text-[11.5px] text-slate-600">
            Due {formatDate(keyDates.dueDate)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
