import { CircleCheck } from "lucide-react";
import { hours, money, moneyWhole } from "@/lib/format";
import type { TestStatus } from "@/lib/month";

function valueLabel(s: TestStatus) {
  return s.kind === "hours" ? hours(s.value) : money(s.value);
}

function thresholdLabel(s: TestStatus) {
  return s.kind === "hours" ? `of ${s.threshold} active hours` : `of ${moneyWhole(s.threshold)} earned after expenses`;
}

function gapLabel(s: TestStatus) {
  if (s.met) return s.kind === "hours" ? `${s.threshold} hours reached` : `${moneyWhole(s.threshold)} reached`;
  return s.kind === "hours" ? `${hours(s.gap)} hours to go` : `${money(s.gap)} to go`;
}

function Bar({ status, height }: { status: TestStatus; height: string }) {
  return (
    <div
      className={`${height} w-full overflow-hidden rounded bg-line`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={status.threshold}
      aria-valuenow={Math.round(status.value * 100) / 100}
      aria-label={status.kind === "hours" ? "Active hours toward 80" : "Earnings toward $580"}
    >
      <div
        className="h-full origin-left rounded bg-accent transition-transform duration-500 motion-reduce:transition-none"
        style={{ transform: `scaleX(${status.share})` }}
      />
    </div>
  );
}

/** The big number: the test closer to its line. */
export function DominantProgress({ status, note }: { status: TestStatus; note?: string }) {
  return (
    <section aria-labelledby="dominant-label" className="pt-2">
      <p id="dominant-label" className="text-sm font-medium text-muted">
        {status.kind === "hours" ? "Hours test" : "Income test"}
      </p>
      <p className="tabular mt-1 text-[56px] font-semibold leading-none tracking-tight" data-testid="dominant-value">
        {valueLabel(status)}
      </p>
      <p className="mt-2 text-[15px] text-muted">{thresholdLabel(status)}</p>
      <div className="mt-5">
        <Bar status={status} height="h-2" />
      </div>
      <p
        className={`tabular mt-3 flex items-center gap-1.5 text-[15px] font-medium ${status.met ? "text-accent" : "text-ink"}`}
        data-testid="dominant-gap"
      >
        {status.met && <CircleCheck className="size-[18px]" strokeWidth={1.75} aria-hidden />}
        {gapLabel(status)}
      </p>
      {note ? <p className="mt-2 text-[13px] leading-snug text-muted">{note}</p> : null}
    </section>
  );
}

/** The other test, smaller. */
export function SecondaryTest({ status, note }: { status: TestStatus; note?: string }) {
  return (
    <section className="border-t border-line pt-4" aria-label={status.kind === "hours" ? "Hours test" : "Income test"}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-muted">{status.kind === "hours" ? "Hours test" : "Income test"}</p>
        <p className={`tabular text-sm font-medium ${status.met ? "text-accent" : "text-ink"}`} data-testid="secondary-gap">
          {gapLabel(status)}
        </p>
      </div>
      <p className="tabular mt-1 text-lg font-semibold" data-testid="secondary-value">
        {valueLabel(status)} <span className="text-[15px] font-normal text-muted">{thresholdLabel(status)}</span>
      </p>
      <div className="mt-2">
        <Bar status={status} height="h-1.5" />
      </div>
      {note ? <p className="mt-2 text-[13px] leading-snug text-muted">{note}</p> : null}
    </section>
  );
}
