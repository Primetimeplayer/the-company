import { AlertTriangle, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import type { CheckStatus } from "@/domain/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pass: {
    label: "Pass",
    Icon: CheckCircle2,
    className: "bg-[#DCFCE7] text-[#166534] ring-[#BBF7D0]",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    className: "bg-[#FEF3C7] text-[#92400E] ring-[#FDE68A]",
  },
  fail: {
    label: "Fail",
    Icon: XCircle,
    className: "bg-[#FEE2E2] text-[#991B1B] ring-[#FECACA]",
  },
  missing: {
    label: "Missing",
    Icon: MinusCircle,
    className: "bg-[#EDE9FE] text-[#5B21B6] ring-[#DDD6FE]",
  },
} as const;

export function StatusChip({
  status,
  className,
}: {
  status: CheckStatus;
  className?: string;
}) {
  const { label, Icon, className: statusClassName } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        statusClassName,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

export function StatusDot({
  status,
  className,
}: {
  status: CheckStatus;
  className?: string;
}) {
  const colours: Record<CheckStatus, string> = {
    pass: "bg-[#22C55E]",
    warning: "bg-[#F59E0B]",
    fail: "bg-[#EF4444]",
    missing: "bg-[#8B5CF6]",
  };
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", colours[status], className)}
      aria-hidden
    />
  );
}
