import { describe, expect, it } from "vitest";
import { shiftToRecentWeek, withoutDuplicates } from "./sample";
import type { Entry } from "./types";

const week = { weekStart: "2026-09-28", weekEnd: "2026-10-04" };

describe("sample week dates", () => {
  it("keeps the sample week while it still touches the current month", () => {
    expect(shiftToRecentWeek(week, "2026-10-13")).toEqual(week);
  });

  it("moves the sample week forward by whole weeks to end on the last Sunday", () => {
    // Nov 18, 2026 is a Wednesday; the last Sunday is Nov 15.
    expect(shiftToRecentWeek(week, "2026-11-18")).toEqual({ weekStart: "2026-11-09", weekEnd: "2026-11-15" });
  });
});

describe("sample duplicates", () => {
  const e = (platform: string, id: string): Entry => ({
    id, platform, weekStart: "2026-09-28", weekEnd: "2026-10-04", activeHours: 10, earnings: 100, expenses: 0,
    source: "screenshot", sample: false, createdAt: "2026-10-13T00:00:00Z",
  });

  it("skips a sample week the person already added", () => {
    const samples = [e("Sample Rides", "s1"), e("Sample Courier", "s2")];
    expect(withoutDuplicates(samples, [e("sample rides", "mine")]).map((x) => x.id)).toEqual(["s2"]);
  });
});
