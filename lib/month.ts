import { HOURS_THRESHOLD, INCOME_THRESHOLD } from "./thresholds";
import type { Entry } from "./types";

/** A calendar month as "YYYY-MM". */
export type MonthKey = string;

const DAY = 86_400_000;

/** Day number for a "YYYY-MM-DD" date, counted in UTC so DST never shifts it. */
function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
}

export function monthOf(iso: string): MonthKey {
  return iso.slice(0, 7);
}

export function previousMonth(month: MonthKey): MonthKey {
  const [y, m] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

function monthBounds(month: MonthKey): { first: number; last: number } {
  const [y, m] = month.split("-").map(Number);
  const first = Date.UTC(y, m - 1, 1) / DAY;
  const last = Date.UTC(y, m, 0) / DAY; // day 0 of next month = last day of this one
  return { first, last };
}

export function monthName(month: MonthKey, withYear = false): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("en-US", {
    month: "long",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

/** Days of the entry that fall inside the month (dates inclusive). */
export function overlapDays(entry: Pick<Entry, "weekStart" | "weekEnd">, month: MonthKey): number {
  const { first, last } = monthBounds(month);
  const start = Math.max(dayNumber(entry.weekStart), first);
  const end = Math.min(dayNumber(entry.weekEnd), last);
  return Math.max(0, end - start + 1);
}

export type CountedEntry = {
  entry: Entry;
  share: number; // part of the entry inside the month, 0 to 1
  prorated: boolean;
  hours: number;
  earnings: number;
  expenses: number;
  net: number;
};

export type MonthTotals = {
  month: MonthKey;
  hours: number;
  earnings: number;
  expenses: number;
  net: number; // earnings after expenses, never below 0 per entry
  entries: CountedEntry[];
};

/**
 * Totals for one month. An entry whose dates cross a month boundary counts in
 * proportion to its days in each month (Sep 29 to Oct 5 counts 5/7 toward October).
 */
export function monthTotals(entries: Entry[], month: MonthKey): MonthTotals {
  const counted: CountedEntry[] = [];
  for (const entry of entries) {
    const inside = overlapDays(entry, month);
    if (inside === 0) continue;
    const total = dayNumber(entry.weekEnd) - dayNumber(entry.weekStart) + 1;
    const share = inside / total;
    counted.push({
      entry,
      share,
      prorated: share < 1,
      hours: entry.activeHours * share,
      earnings: entry.earnings * share,
      expenses: entry.expenses * share,
      net: Math.max(0, entry.earnings - entry.expenses) * share,
    });
  }
  counted.sort((a, b) => b.entry.weekStart.localeCompare(a.entry.weekStart));
  const sum = (key: "hours" | "earnings" | "expenses" | "net") => counted.reduce((s, c) => s + c[key], 0);
  return {
    month,
    hours: sum("hours"),
    earnings: sum("earnings"),
    expenses: sum("expenses"),
    net: sum("net"),
    entries: counted,
  };
}

export type TestStatus = {
  kind: "hours" | "income";
  value: number;
  threshold: number;
  share: number; // value / threshold, capped at 1
  met: boolean;
  gap: number; // amount still needed, 0 once met
};

export function testStatus(kind: "hours" | "income", totals: MonthTotals): TestStatus {
  const value = kind === "hours" ? totals.hours : totals.net;
  const threshold = kind === "hours" ? HOURS_THRESHOLD : INCOME_THRESHOLD;
  // Compare at display precision so 79.996 hours never reads as both "80" and "not reached".
  const rounded = kind === "hours" ? Math.round(value * 10) / 10 : Math.round(value * 100) / 100;
  const met = rounded >= threshold;
  return {
    kind,
    value,
    threshold,
    share: Math.min(1, value / threshold),
    met,
    gap: met ? 0 : threshold - rounded,
  };
}

/** The test closer to its line becomes the big number. Ties go to hours. */
export function dominantTest(totals: MonthTotals): "hours" | "income" {
  return totals.hours / HOURS_THRESHOLD >= totals.net / INCOME_THRESHOLD ? "hours" : "income";
}

/** Calendar days after today in the month, or "ended" for a past month. */
export function daysLeft(month: MonthKey, todayIso: string): number | "ended" {
  const today = dayNumber(todayIso);
  const { last } = monthBounds(month);
  if (today > last) return "ended";
  return last - today;
}
