import { describe, expect, it } from "vitest";
import { shiftToRecentWeek } from "./sample";

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
