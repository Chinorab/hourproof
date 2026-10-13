"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, FlaskConical, LoaderCircle, Plus, TriangleAlert } from "lucide-react";
import { DominantProgress, SecondaryTest } from "@/components/TestProgress";
import { EntriesList } from "@/components/EntriesList";
import { HonestyNote, HOUSEHOLD_NOTE } from "@/components/HonestyNote";
import { SampleBanner } from "@/components/SampleBanner";
import {
  clearAll,
  clearSample,
  loadEntries,
  removeEntry,
  saveEntries,
  useEntries,
  useStorageAvailable,
  useToday,
} from "@/lib/storage";
import { readSamples } from "@/lib/sample";
import { plural } from "@/lib/format";
import { daysLeft, dominantTest, monthName, monthOf, monthTotals, previousMonth, testStatus } from "@/lib/month";

export default function ThisMonthPage() {
  const entries = useEntries();
  const today = useToday();
  const canSave = useStorageAvailable();
  const [view, setView] = useState<"current" | "previous">("current");
  const [sampleState, setSampleState] = useState<"idle" | "reading" | "failed">("idle");
  const [confirmClear, setConfirmClear] = useState(false);

  // Wait for the device's own date and saved entries before rendering numbers.
  if (!entries || !today) return <div className="h-96" aria-busy="true" />;

  const current = monthOf(today);
  const month = view === "current" ? current : previousMonth(current);
  const totals = monthTotals(entries, month);
  const dominant = dominantTest(totals);
  const main = testStatus(dominant, totals);
  const other = testStatus(dominant === "hours" ? "income" : "hours", totals);
  const left = daysLeft(month, today);
  const hasSample = entries.some((e) => e.sample);

  async function trySample(day: string) {
    setSampleState("reading");
    const result = await readSamples(day);
    if (result === "failed") {
      setSampleState("failed");
      return;
    }
    saveEntries([...loadEntries().filter((e) => !e.sample), ...result]);
    setView("current");
    setSampleState("idle");
  }

  return (
    <div className="space-y-6">
      {!canSave && (
        <div className="flex gap-3 rounded-lg bg-attention-soft p-4 text-sm ring-1 ring-attention/30" role="status">
          <TriangleAlert className="mt-0.5 size-[18px] shrink-0 text-attention" strokeWidth={1.75} aria-hidden />
          <p>Your entries can&apos;t be saved on this device. They will be gone when you close this page.</p>
        </div>
      )}

      {hasSample && <SampleBanner onClear={clearSample} />}

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

      <div className="space-y-3">
        <Link
          href="/add"
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[16px] font-semibold text-white transition-colors hover:bg-accent-strong active:translate-y-px"
        >
          <Plus className="size-5" strokeWidth={1.75} aria-hidden />
          Add earnings
        </Link>

        <Link
          href={`/summary?month=${month}`}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-[15px] font-medium transition-colors hover:bg-bg"
        >
          <FileText className="size-5" strokeWidth={1.75} aria-hidden />
          Monthly summary
        </Link>

        {!hasSample && (
          <button
            type="button"
            onClick={() => trySample(today)}
            disabled={sampleState === "reading"}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-[15px] font-medium transition-colors hover:bg-bg disabled:cursor-wait disabled:text-muted"
          >
            {sampleState === "reading" ? (
              <>
                <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" strokeWidth={1.75} aria-hidden />
                Reading 3 sample screenshots…
              </>
            ) : (
              <>
                <FlaskConical className="size-5" strokeWidth={1.75} aria-hidden />
                Try with sample data
              </>
            )}
          </button>
        )}
        {sampleState === "failed" && (
          <p className="text-sm text-error" role="alert">
            The sample screenshots couldn&apos;t be read right now. Try again in a moment, or enter a week by hand.
          </p>
        )}
      </div>

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
            <EntriesList entries={totals.entries} onRemove={removeEntry} />
          </div>
        )}
      </section>

      <HonestyNote />

      {entries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
          {confirmClear ? (
            <>
              <p className="w-full text-sm text-muted">This removes every entry saved on this device.</p>
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setConfirmClear(false);
                }}
                className="h-10 rounded-lg bg-error px-4 text-sm font-semibold text-white hover:opacity-90"
              >
                Clear all entries
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="h-10 rounded-lg border border-line bg-surface px-4 text-sm font-medium hover:bg-bg"
              >
                Keep my entries
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="-ml-2 h-10 rounded-lg px-2 text-sm font-medium text-muted underline underline-offset-2 hover:text-ink"
            >
              Clear my data
            </button>
          )}
        </div>
      )}
    </div>
  );
}
