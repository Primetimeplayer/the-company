import { AlertTriangle, CalendarClock, FileWarning, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CheckScore } from "@/domain/types";

interface StatCardsProps {
  score: CheckScore;
  issues: number;
  missing: number;
  daysUntilDue: number;
  dueDateLabel: string;
}

export function StatCards({
  score,
  issues,
  missing,
  daysUntilDue,
  dueDateLabel,
}: StatCardsProps) {
  const overdue = daysUntilDue < 0;

  const cards = [
    {
      label: "Checks passed",
      value: `${score.passed}/${score.total}`,
      hint: "Automated checks",
      Icon: ShieldCheck,
      tile: "bg-indigo-50 text-brand-indigo",
    },
    {
      label: "Issues to fix",
      value: String(issues),
      hint: "Failed checks",
      Icon: AlertTriangle,
      tile: "bg-[#FEE2E2] text-[#991B1B]",
    },
    {
      label: "Missing evidence",
      value: String(missing),
      hint: "Files to add",
      Icon: FileWarning,
      tile: "bg-[#EDE9FE] text-[#5B21B6]",
    },
    {
      label: overdue ? "Days past due date" : "Days until due date",
      value: String(Math.abs(daysUntilDue)),
      hint: dueDateLabel,
      Icon: CalendarClock,
      tile: "bg-[#FEF3C7] text-[#92400E]",
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, hint, Icon, tile }) => (
        <Card key={label} className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12px] font-medium text-slate-500">{label}</p>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tile}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          <p className="mt-0.5 text-[11.5px] text-slate-500">{hint}</p>
        </Card>
      ))}
    </div>
  );
}
