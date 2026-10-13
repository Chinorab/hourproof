"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { loadEntries } from "@/lib/storage";
import { rangeLabel } from "@/lib/dates";
import type { Entry } from "@/lib/types";

export default function ThisMonthPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const hours = (entries ?? []).reduce((sum, e) => sum + e.activeHours, 0);
  const net = (entries ?? []).reduce((sum, e) => sum + Math.max(0, e.earnings - e.expenses), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">This month</h1>

      <dl className="tabular mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-sm text-muted">Active hours</dt>
          <dd className="mt-1 text-2xl font-semibold" data-testid="total-hours">{hours.toFixed(1)}</dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-sm text-muted">Earnings after expenses</dt>
          <dd className="mt-1 text-2xl font-semibold" data-testid="total-net">${net.toFixed(2)}</dd>
        </div>
      </dl>

      <Link
        href="/add"
        className="mt-5 flex h-14 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[16px] font-semibold text-white hover:bg-accent-strong"
      >
        <Plus className="size-5" strokeWidth={1.75} aria-hidden />
        Add earnings
      </Link>

      <h2 className="mt-8 text-base font-semibold">Entries</h2>
      {entries && entries.length === 0 && <p className="mt-2 text-sm text-muted">No earnings added yet.</p>}
      {entries && entries.length > 0 && (
      <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-surface">
        {(entries ?? []).map((e) => (
          <li key={e.id} className="tabular flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{e.platform}</p>
              <p className="text-sm text-muted">{rangeLabel(e.weekStart, e.weekEnd)}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{e.activeHours} h</p>
              <p className="text-muted">${(e.earnings - e.expenses).toFixed(2)}</p>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
