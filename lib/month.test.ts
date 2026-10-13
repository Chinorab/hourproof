import { describe, expect, it } from "vitest";
import { daysLeft, dominantTest, monthTotals, overlapDays, previousMonth, testStatus } from "./month";
import type { Entry } from "./types";

const entry = (over: Partial<Entry>): Entry => ({
  id: Math.random().toString(36),
  platform: "Sample",
  weekStart: "2026-10-05",
  weekEnd: "2026-10-11",
  activeHours: 10,
  earnings: 100,
  expenses: 0,
  source: "manual",
  sample: false,
  createdAt: "2026-10-12T00:00:00Z",
  ...over,
});

describe("proration", () => {
  it("counts Sep 29 to Oct 5 as 5/7 toward October and 2/7 toward September", () => {
    const e = entry({ weekStart: "2026-09-29", weekEnd: "2026-10-05", activeHours: 14, earnings: 70 });
    expect(overlapDays(e, "2026-10")).toBe(5);
    expect(overlapDays(e, "2026-09")).toBe(2);
    const oct = monthTotals([e], "2026-10");
    expect(oct.hours).toBeCloseTo(10);
    expect(oct.net).toBeCloseTo(50);
    expect(oct.entries[0].prorated).toBe(true);
    expect(monthTotals([e], "2026-09").hours).toBeCloseTo(4);
  });

  it("counts a week fully inside the month in full", () => {
    const t = monthTotals([entry({})], "2026-10");
    expect(t.hours).toBe(10);
    expect(t.entries[0].prorated).toBe(false);
  });

  it("ignores entries outside the month", () => {
    expect(monthTotals([entry({ weekStart: "2026-08-03", weekEnd: "2026-08-09" })], "2026-10").entries).toHaveLength(0);
  });

  it("handles a year boundary", () => {
    const e = entry({ weekStart: "2026-12-28", weekEnd: "2027-01-03", activeHours: 7 });
    expect(monthTotals([e], "2026-12").hours).toBeCloseTo(4);
    expect(monthTotals([e], "2027-01").hours).toBeCloseTo(3);
    expect(previousMonth("2027-01")).toBe("2026-12");
  });
});

describe("expenses", () => {
  it("subtracts expenses from earnings", () => {
    expect(monthTotals([entry({ earnings: 300, expenses: 40 })], "2026-10").net).toBe(260);
  });

  it("counts an entry whose expenses exceed earnings as 0, not negative", () => {
    const t = monthTotals([entry({ earnings: 50, expenses: 80 }), entry({ earnings: 100 })], "2026-10");
    expect(t.net).toBe(100);
  });
});

describe("tests against the thresholds", () => {
  it("picks the test closer to its line", () => {
    expect(dominantTest(monthTotals([entry({ activeHours: 60, earnings: 200 })], "2026-10"))).toBe("hours");
    expect(dominantTest(monthTotals([entry({ activeHours: 20, earnings: 500 })], "2026-10"))).toBe("income");
  });

  it("reports the gap and the met state", () => {
    const t = monthTotals([entry({ activeHours: 62.5, earnings: 412 })], "2026-10");
    expect(testStatus("hours", t).gap).toBeCloseTo(17.5);
    expect(testStatus("income", t).gap).toBeCloseTo(168);
    const done = monthTotals([entry({ activeHours: 80, earnings: 580 })], "2026-10");
    expect(testStatus("hours", done).met).toBe(true);
    expect(testStatus("income", done).met).toBe(true);
    expect(testStatus("hours", done).gap).toBe(0);
  });

  it("treats 79.96 hours as 80 at display precision", () => {
    expect(testStatus("hours", monthTotals([entry({ activeHours: 79.96 })], "2026-10")).met).toBe(true);
  });
});

describe("days left", () => {
  it("counts calendar days after today", () => {
    expect(daysLeft("2026-10", "2026-10-13")).toBe(18);
    expect(daysLeft("2026-10", "2026-10-31")).toBe(0);
  });

  it("marks a past month as ended", () => {
    expect(daysLeft("2026-09", "2026-10-13")).toBe("ended");
  });
});
