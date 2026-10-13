"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { rangeLabel } from "@/lib/dates";
import { hours, money } from "@/lib/format";
import type { CountedEntry } from "@/lib/month";

export function EntriesList({ entries, onRemove }: { entries: CountedEntry[]; onRemove: (id: string) => void }) {
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-surface" data-testid="entries">
      {entries.map((c) => (
        <li key={c.entry.id} className="p-4">
          <div className="tabular flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{c.entry.platform}</p>
              <p className="text-sm text-muted">
                {rangeLabel(c.entry.weekStart, c.entry.weekEnd)}
                {c.prorated && (
                  <span className="ml-2 rounded border border-line px-1.5 py-px text-xs font-medium text-muted">
                    Prorated
                  </span>
                )}
              </p>
            </div>
            <div className="shrink-0 text-right text-sm">
              <p className="font-medium">{hours(c.hours)} h</p>
              <p className="text-muted">{money(c.net)}</p>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            <Link
              href={`/add?edit=${c.entry.id}`}
              className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted hover:bg-bg hover:text-ink"
            >
              <Pencil className="size-4" strokeWidth={1.75} aria-hidden />
              Edit
            </Link>
            {confirming === c.entry.id ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onRemove(c.entry.id);
                    setConfirming(null);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-error hover:bg-error-soft"
                >
                  <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                  Confirm remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="inline-flex h-9 items-center rounded-lg px-2 text-sm font-medium text-muted hover:bg-bg"
                >
                  Keep
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(c.entry.id)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted hover:bg-bg hover:text-ink"
              >
                <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                Remove
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
