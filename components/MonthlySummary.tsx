"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Printer } from "lucide-react";
import { useEntries, useToday } from "@/lib/storage";
import { rangeLabel } from "@/lib/dates";
import { hours, money, moneyWhole } from "@/lib/format";
import { monthName, monthOf, monthTotals, testStatus, type TestStatus } from "@/lib/month";
import { HOURS_THRESHOLD, INCOME_THRESHOLD, FEDERAL_MIN_WAGE } from "@/lib/thresholds";

function resultLine(s: TestStatus) {
  if (s.kind === "hours") {
    return s.met
      ? `${hours(s.value)} of ${HOURS_THRESHOLD} active hours. ${HOURS_THRESHOLD} hours reached.`
      : `${hours(s.value)} of ${HOURS_THRESHOLD} active hours. ${hours(s.gap)} hours below the threshold.`;
  }
  return s.met
    ? `${money(s.value)} of ${moneyWhole(INCOME_THRESHOLD)} earned after expenses. ${moneyWhole(INCOME_THRESHOLD)} reached.`
    : `${money(s.value)} of ${moneyWhole(INCOME_THRESHOLD)} earned after expenses. ${money(s.gap)} below the threshold.`;
}

export function MonthlySummary() {
  const params = useSearchParams();
  const entries = useEntries();
  const today = useToday();
  if (!entries || !today) return <div className="h-96" aria-busy="true" />;

  const requested = params.get("month");
  const month = requested && /^\d{4}-\d{2}$/.test(requested) ? requested : monthOf(today);
  const totals = monthTotals(entries, month);
  const hoursTest = testStatus("hours", totals);
  const incomeTest = testStatus("income", totals);
  const hasSample = totals.entries.some((c) => c.entry.sample);
  const anyProrated = totals.entries.some((c) => c.prorated);
  const generated = new Date(`${today}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="print:text-[11pt] print:leading-snug">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link href="/" className="-ml-1 inline-flex h-10 items-center gap-1 text-sm font-medium text-muted hover:text-ink">
          <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
          This month
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong"
        >
          <Printer className="size-4" strokeWidth={1.75} aria-hidden />
          Print or save as PDF
        </button>
      </div>

      <article className="mt-4 rounded-xl border border-line bg-surface p-5 print:mt-0 print:rounded-none print:border-0 print:p-0">
        <header className="border-b border-line pb-4">
          <p className="text-sm font-medium text-muted" translate="no">
            HourProof
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-balance">
            Monthly earnings summary, {monthName(month, true)}
          </h1>
          <p className="mt-1 text-sm text-muted">Generated {generated}. A personal record, not an official document.</p>
          {hasSample && (
            <p className="mt-3 rounded-md bg-attention-soft px-3 py-2 text-sm font-semibold text-attention print:border print:border-attention">
              Sample data. Entries come from sample screenshots of fictional apps.
            </p>
          )}
        </header>

        <section className="mt-4" aria-labelledby="entries-title">
          <h2 id="entries-title" className="text-sm font-semibold">
            Entries counted in {monthName(month)}
          </h2>
          {totals.entries.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No earnings were added for this month.</p>
          ) : (
            <table className="tabular mt-2 w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 pr-2 font-medium">App and dates</th>
                  <th className="py-2 pr-2 text-right font-medium">Active hours</th>
                  <th className="hidden py-2 pr-2 text-right font-medium print:table-cell">Earnings</th>
                  <th className="hidden py-2 pr-2 text-right font-medium print:table-cell">Expenses</th>
                  <th className="py-2 text-right font-medium">After expenses</th>
                </tr>
              </thead>
              <tbody>
                {totals.entries.map((c) => (
                  <tr key={c.entry.id} className="border-b border-line align-top">
                    <td className="py-2 pr-2">
                      <span className="font-medium break-words">{c.entry.platform}</span>
                      <span className="block text-muted">
                        {rangeLabel(c.entry.weekStart, c.entry.weekEnd)}
                        {c.prorated ? " *" : ""}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-right">{hours(c.hours)}</td>
                    <td className="hidden py-2 pr-2 text-right print:table-cell">{money(c.earnings)}</td>
                    <td className="hidden py-2 pr-2 text-right print:table-cell">{money(c.expenses)}</td>
                    <td className="py-2 text-right">{money(c.net)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="py-2 pr-2">Total</td>
                  <td className="py-2 pr-2 text-right" data-testid="summary-hours">
                    {hours(totals.hours)}
                  </td>
                  <td className="hidden py-2 pr-2 text-right print:table-cell">{money(totals.earnings)}</td>
                  <td className="hidden py-2 pr-2 text-right print:table-cell">{money(totals.expenses)}</td>
                  <td className="py-2 text-right" data-testid="summary-net">
                    {money(totals.net)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
          {anyProrated && (
            <p className="mt-2 text-xs text-muted">
              * Week crosses into another month. Only the days in {monthName(month)} are counted, in proportion.
            </p>
          )}
        </section>

        <section className="mt-5" aria-labelledby="thresholds-title">
          <h2 id="thresholds-title" className="text-sm font-semibold">
            Compared with the federal thresholds
          </h2>
          <dl className="tabular mt-2 space-y-2 text-sm">
            <div>
              <dt className="font-medium">Hours test (80 hours per month)</dt>
              <dd className="text-muted" data-testid="summary-hours-result">
                {resultLine(hoursTest)}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Income test (federal minimum wage x 80 hours)</dt>
              <dd className="text-muted" data-testid="summary-income-result">
                {resultLine(incomeTest)}
              </dd>
            </div>
          </dl>
        </section>

        <footer className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
          <p>
            These are self reported numbers compared with the federal thresholds. Only your state Medicaid agency decides
            whether you meet the requirement. Your state looks at your household income; this summary only counts gig
            earnings after expenses. Active hours are time on trips, deliveries or jobs, not time online.
          </p>
          <p className="mt-2">
            Thresholds: 80 hours, or {moneyWhole(INCOME_THRESHOLD)} per month (${FEDERAL_MIN_WAGE.toFixed(2)} x{" "}
            {HOURS_THRESHOLD}), from the CMS interim final rule CMS-2454-IFC (June 1, 2026). More at{" "}
            <a href="https://www.medicaid.gov" className="font-medium text-accent underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              medicaid.gov
            </a>
            .
          </p>
        </footer>
      </article>
    </div>
  );
}
