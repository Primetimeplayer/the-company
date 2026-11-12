import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  getDaysInMonth,
  parseISO,
  setDate,
} from "date-fns";
import type { ISODateString } from "@/domain/types";

/** UK display format: 02/02/2026. */
export function formatDate(iso: ISODateString | undefined): string {
  if (!iso) return "—";
  return format(parseISO(iso), "dd/MM/yyyy");
}

export function addDaysISO(iso: ISODateString, days: number): ISODateString {
  return format(addDays(parseISO(iso), days), "yyyy-MM-dd");
}

export function addMonthsISO(iso: ISODateString, months: number): ISODateString {
  return format(addMonths(parseISO(iso), months), "yyyy-MM-dd");
}

/** Whole calendar days from `fromISO` to `toISO` (positive when `to` is later). */
export function daysBetweenISO(
  fromISO: ISODateString,
  toISO: ISODateString,
): number {
  return differenceInCalendarDays(parseISO(toISO), parseISO(fromISO));
}

/**
 * The contractual application date for a period: the first occurrence of
 * `applicationDayOfMonth` on or after the period end.
 *
 * The day is clamped to the last day of the month, so day 31 in February gives
 * 28/29 February and never rolls into March.
 */
export function applicationDateForPeriod(
  periodEndISO: ISODateString,
  applicationDayOfMonth: number,
): ISODateString {
  const periodEnd = parseISO(periodEndISO);

  if (periodEnd.getDate() <= applicationDayOfMonth) {
    const clampedDay = Math.min(
      applicationDayOfMonth,
      getDaysInMonth(periodEnd),
    );
    return format(setDate(periodEnd, clampedDay), "yyyy-MM-dd");
  }

  const nextMonth = addMonths(periodEnd, 1);
  const clampedDay = Math.min(applicationDayOfMonth, getDaysInMonth(nextMonth));
  return format(setDate(nextMonth, clampedDay), "yyyy-MM-dd");
}
