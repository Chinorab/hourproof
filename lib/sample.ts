"use client";

import { readScreenshot } from "./read";
import { monthOf, overlapDays } from "./month";
import type { Entry, ExtractedEntry } from "./types";

// Sample screenshots of fictional gig apps, each marked SAMPLE in the image.
export const SAMPLE_FILES = ["parcelfox", "loopride", "tidyhands"] as const;

const DAY = 86_400_000;
const toDay = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / DAY;
const fromDay = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);

/**
 * The sample images are fixed pictures of one week (Sep 28 to Oct 4, 2026). When
 * that week no longer touches the current month, move it forward by whole weeks
 * so it ends on the most recent Sunday. Weekdays and amounts stay as read.
 */
export function shiftToRecentWeek(entry: Pick<Entry, "weekStart" | "weekEnd">, today: string) {
  if (overlapDays(entry, monthOf(today)) > 0) return entry;
  const t = toDay(today);
  const dow = new Date(t * DAY).getUTCDay(); // 0 = Sunday
  const lastSunday = t - dow;
  const weeks = Math.floor((lastSunday - toDay(entry.weekEnd)) / 7);
  if (weeks <= 0) return entry;
  return { weekStart: fromDay(toDay(entry.weekStart) + weeks * 7), weekEnd: fromDay(toDay(entry.weekEnd) + weeks * 7) };
}

function toEntry(e: ExtractedEntry, today: string): Entry | null {
  if (!e.platform_name || !e.week_start || !e.week_end || e.active_hours === null || e.earnings_total === null) {
    return null;
  }
  const dates = shiftToRecentWeek({ weekStart: e.week_start, weekEnd: e.week_end }, today);
  return {
    id: crypto.randomUUID(),
    platform: e.platform_name,
    ...dates,
    activeHours: e.active_hours,
    earnings: e.earnings_total,
    expenses: 0,
    source: "screenshot",
    sample: true,
    createdAt: new Date().toISOString(),
  };
}

/** Reads the three sample screenshots through the real extraction route. */
export async function readSamples(today: string): Promise<Entry[] | "failed"> {
  const results = await Promise.all(
    SAMPLE_FILES.map(async (name) => {
      const res = await fetch(`/samples/${name}.png`);
      if (!res.ok) return "unavailable" as const;
      return readScreenshot(await res.blob());
    }),
  );
  const entries = results.flatMap((r) => (Array.isArray(r) ? r : [])).map((e) => toEntry(e, today));
  const complete = entries.filter((e): e is Entry => e !== null);
  return complete.length > 0 ? complete : "failed";
}
