"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DominantProgress, SecondaryTest } from "@/components/TestProgress";
import { EntriesList } from "@/components/EntriesList";
import { HonestyNote, HOUSEHOLD_NOTE } from "@/components/HonestyNote";
import { removeEntry, useEntries, useToday } from "@/lib/storage";
import { plural } from "@/lib/format";
import { daysLeft, dominantTest, monthName, monthOf, monthTotals, previousMonth, testStatus } from "@/lib/month";

export default function ThisMonthPage() {
  const entries = useEntries();
  const today = useToday();
  const [view, setView] = useState<"current" | "previous">("current");

  // Wait for the device's own date and saved entries before rendering numbers.
  if (!entries || !today) return <div className="h-96" aria-busy="true" />;

  const current = monthOf(today);
  const month = view === "current" ? current : previousMonth(current);
  const totals = monthTotals(entries, month);
  const dominant = dominantTest(totals);
  const main = testStatus(dominant, totals);
  const other = testStatus(dominant === "hours" ? "income" : "hours", totals);
  const left = daysLeft(month, today);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{monthName(month, true)}</h1>
          <p className="mt-0.5 text-sm text-muted" data-testid="days-left">
            {left === "ended"
              ? "This month has ended"
              : left === 0
                ? `Last day of ${monthName(month)}`
                : `${plural(left, "day", "days")} left in ${monthName(month)}`}
          </p>
        </div>
        <div className="flex shrink-0 rounded-lg border border-line bg-surface p-0.5 text-sm" role="group" aria-label="Month">
          {(["current", "previous"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`h-8 rounded-md px-3 font-medium transition-colors ${
                view === v ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {monthName(v === "current" ? current : previousMonth(current)).slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <DominantProgress status={main} note={main.kind === "income" ? HOUSEHOLD_NOTE : undefined} />

      <Link
        href="/add"
        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[16px] font-semibold text-white transition-colors hover:bg-accent-strong active:translate-y-px"
      >
        <Plus className="size-5" strokeWidth={1.75} aria-hidden />
        Add earnings
      </Link>

      <SecondaryTest status={other} note={other.kind === "income" ? HOUSEHOLD_NOTE : undefined} />

      <section aria-labelledby="entries-heading">
        <h2 id="entries-heading" className="text-base font-semibold">
          Entries
        </h2>
        {totals.entries.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No earnings for {monthName(month)} yet. Add a weekly earnings screenshot or enter a week by hand.
          </p>
        ) : (
          <div className="mt-2">
            <EntriesList
              entries={totals.entries}
              onRemove={removeEntry}
            />
          </div>
        )}
      </section>

      <HonestyNote />
    </div>
  );
}
