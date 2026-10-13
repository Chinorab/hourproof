export type Entry = {
  id: string;
  platform: string;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD, never before weekStart
  activeHours: number; // active time only, never online time
  earnings: number; // USD, tips included
  expenses: number; // USD, entered by the person, default 0
  source: "screenshot" | "manual";
  sample: boolean;
  createdAt: string; // ISO timestamp
};

/** One entry as read from a screenshot. Anything Claude could not see is null. */
export type ExtractedEntry = {
  platform_name: string | null;
  week_start: string | null;
  week_end: string | null;
  active_hours: number | null;
  online_hours: number | null;
  earnings_total: number | null;
};

export type ExtractResponse =
  | { ok: true; entries: ExtractedEntry[] }
  | { ok: false; error: "unreadable" | "too_large" | "unavailable" | "bad_request" };
