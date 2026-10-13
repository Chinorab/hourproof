"use client";

import { useState } from "react";
import type { Entry, ExtractedEntry } from "@/lib/types";

export type Draft = {
  platform: string;
  weekStart: string;
  weekEnd: string;
  activeHours: string;
  earnings: string;
  expenses: string;
};

export function draftFromExtracted(e: ExtractedEntry): Draft {
  return {
    platform: e.platform_name ?? "",
    weekStart: e.week_start ?? "",
    weekEnd: e.week_end ?? "",
    activeHours: e.active_hours === null ? "" : String(e.active_hours),
    earnings: e.earnings_total === null ? "" : String(e.earnings_total),
    expenses: "0",
  };
}

export function draftFromEntry(e: Entry): Draft {
  return {
    platform: e.platform,
    weekStart: e.weekStart,
    weekEnd: e.weekEnd,
    activeHours: String(e.activeHours),
    earnings: String(e.earnings),
    expenses: String(e.expenses),
  };
}

export const emptyDraft: Draft = {
  platform: "",
  weekStart: "",
  weekEnd: "",
  activeHours: "",
  earnings: "",
  expenses: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function problems(d: Draft): Partial<Record<keyof Draft, string>> {
  const p: Partial<Record<keyof Draft, string>> = {};
  if (!d.platform.trim()) p.platform = "Add the app name.";
  if (!d.weekStart) p.weekStart = "Add the first day.";
  if (!d.weekEnd) p.weekEnd = "Add the last day.";
  if (d.weekStart && d.weekEnd && d.weekEnd < d.weekStart) p.weekEnd = "The last day can't be before the first day.";
  const h = num(d.activeHours);
  if (!Number.isFinite(h) || h < 0) p.activeHours = "Add active time. Active time is what counts.";
  const e = num(d.earnings);
  if (!Number.isFinite(e) || e < 0) p.earnings = "Add the week's earnings.";
  const x = d.expenses.trim() === "" ? 0 : Number(d.expenses);
  if (!Number.isFinite(x) || x < 0) p.expenses = "Use 0 or more.";
  return p;
}

export function draftToValues(d: Draft) {
  return {
    platform: d.platform.trim(),
    weekStart: d.weekStart,
    weekEnd: d.weekEnd,
    activeHours: Number(Number(d.activeHours).toFixed(2)),
    earnings: Number(Number(d.earnings).toFixed(2)),
    expenses: d.expenses.trim() === "" ? 0 : Number(Number(d.expenses).toFixed(2)),
  };
}

type Props = {
  initial: Draft;
  title: string;
  submitLabel: string;
  note?: React.ReactNode;
  onSubmit: (draft: Draft) => void;
  onCancel: () => void;
};

export function ReviewCard({ initial, title, submitLabel, note, onSubmit, onCancel }: Props) {
  const [draft, setDraft] = useState<Draft>(initial);
  const issues = problems(draft);
  const valid = Object.keys(issues).length === 0;

  const set = (key: keyof Draft) => (ev: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: ev.target.value }));

  return (
    <form
      className="rounded-xl border border-line bg-surface p-4"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (valid) onSubmit(draft);
      }}
    >
      <h2 className="text-base font-semibold break-words text-balance">{title}</h2>
      {note ? <div className="mt-1 text-sm text-muted">{note}</div> : null}

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4">
        <Field label="App name" error={issues.platform} className="col-span-2">
          <input value={draft.platform} onChange={set("platform")} autoComplete="off" name="platform" />
        </Field>
        <Field label="First day" error={issues.weekStart}>
          <input type="date" value={draft.weekStart} onChange={set("weekStart")} name="weekStart" autoComplete="off" />
        </Field>
        <Field label="Last day" error={issues.weekEnd}>
          <input type="date" value={draft.weekEnd} onChange={set("weekEnd")} name="weekEnd" autoComplete="off" />
        </Field>
        <Field label="Active hours" error={issues.activeHours}>
          <input inputMode="decimal" value={draft.activeHours} onChange={set("activeHours")} name="activeHours" autoComplete="off" />
        </Field>
        <Field label="Earnings ($)" error={issues.earnings}>
          <input inputMode="decimal" value={draft.earnings} onChange={set("earnings")} name="earnings" autoComplete="off" />
        </Field>
        <Field
          label="Business expenses ($)"
          hint="Optional. Gas, mileage or supplies for this work."
          error={issues.expenses}
          className="col-span-2"
        >
          <input inputMode="decimal" value={draft.expenses} onChange={set("expenses")} name="expenses" autoComplete="off" />
        </Field>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={!valid}
          className="h-11 flex-1 rounded-lg bg-accent px-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-lg border border-line bg-surface px-4 text-[15px] font-medium text-ink hover:bg-bg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <span
        className={`mt-1 block rounded-lg border [&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:bg-transparent [&>input]:px-3 [&>input]:text-[16px] [&>input]:outline-none ${
          error ? "border-attention bg-attention-soft" : "border-line bg-surface"
        }`}
      >
        {children}
      </span>
      {error ? (
        <span className="mt-1 block text-[13px] text-attention">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[13px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
