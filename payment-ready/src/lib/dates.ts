import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
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

/** The contractual application date for a period, e.g. the 25th. */
export function applicationDateForPeriod(
  periodEndISO: ISODateString,
  dayOfMonth: number,
): ISODateString {
  return format(setDate(parseISO(periodEndISO), dayOfMonth), "yyyy-MM-dd");
}
