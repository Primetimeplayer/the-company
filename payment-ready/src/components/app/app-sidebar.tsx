import Link from "next/link";
import {
  CalendarClock,
  ClipboardList,
  Files,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Plus,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { StatusDot } from "@/components/status-chip";
import { cn } from "@/lib/utils";
import type { CheckStatus } from "@/domain/types";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/app", Icon: LayoutDashboard, active: true },
  { label: "Projects", href: "/app", Icon: FolderKanban, active: false },
  { label: "Documents", href: "/app", Icon: Files, active: false },
  { label: "Applications", href: "/app", Icon: ClipboardList, active: false },
  {
    label: "Client requirements",
    href: "/app",
    Icon: ListChecks,
    active: false,
  },
  { label: "Key dates", href: "/app", Icon: CalendarClock, active: false },
];

const STATUS_ITEMS: { status: CheckStatus; label: string; countKey: keyof Counts }[] = [
  { status: "pass", label: "Passed checks", countKey: "pass" },
  { status: "warning", label: "Warnings", countKey: "warning" },
  { status: "fail", label: "Failed checks", countKey: "fail" },
  { status: "missing", label: "Missing evidence", countKey: "missing" },
];

export interface Counts {
  pass: number;
  warning: number;
  fail: number;
  missing: number;
}

export function AppSidebar({ counts }: { counts: Counts | null }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
      <div className="px-5 py-5">
        <Brand />
      </div>

      <div className="px-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-from to-brand-to px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          title="Demo only — uploads are not stored"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New application
        </button>
      </div>

      <nav aria-label="Sections" className="mt-6 flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ label, href, Icon, active }) => (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-slate-100 text-brand-ink"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-7 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Status
          </p>
        </div>
        <ul className="mt-2 space-y-1">
          {STATUS_ITEMS.map(({ status, label, countKey }) => (
            <li
              key={label}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 text-[12px] text-slate-600"
            >
              <span className="flex items-center gap-2">
                <StatusDot status={status} />
                {label}
              </span>
              <span className="tabular-nums text-slate-400">
                {counts ? counts[countKey] : "—"}
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
          Demo workspace. All projects, documents and figures are fictional sample
          data.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav({ counts }: { counts: Counts | null }) {
  return (
    <div className="border-b border-border bg-white lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Brand />
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
          Sample data
        </span>
      </div>
      <nav aria-label="Sections" className="overflow-x-auto px-2 pb-2">
        <ul className="flex min-w-max items-center gap-1">
          {NAV_ITEMS.map(({ label, href, Icon, active }) => (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-slate-100 text-brand-ink"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-4 px-4 pb-3 text-[11px] text-slate-500">
        {STATUS_ITEMS.map(({ status, label, countKey }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <StatusDot status={status} />
            {counts ? counts[countKey] : "—"}
            <span className="sr-only">{label}</span>
          </span>
        ))}
        <span className="sr-only">Status counts</span>
      </div>
    </div>
  );
}
