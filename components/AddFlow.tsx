"use client";

import { newId } from "@/lib/id";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, TriangleAlert } from "lucide-react";
import { UploadPanel } from "@/components/UploadPanel";
import type { ReadError } from "@/lib/read";
import {
  ReviewCard,
  draftFromEntry,
  draftFromExtracted,
  draftToValues,
  emptyDraft,
  type Draft,
} from "@/components/ReviewCard";
import { addEntry, loadEntries, updateEntry, useEntries } from "@/lib/storage";
import { rangeLabel } from "@/lib/dates";
import type { Entry, ExtractedEntry } from "@/lib/types";

const ERRORS: Record<ReadError, string> = {
  unreadable: "We couldn't find hours and earnings in this image.",
  too_large: "This image is too large. Try a smaller screenshot.",
  unavailable: "Reading is not available right now. You can enter this week by hand.",
};

type Step =
  | { kind: "choose" }
  | { kind: "review"; queue: ExtractedEntry[]; index: number }
  | { kind: "manual" }
  | { kind: "error"; error: ReadError };

type Pending = { draft: Draft; source: Entry["source"]; after: () => void };

function isDuplicate(draft: Draft, ignoreId?: string): boolean {
  const v = draftToValues(draft);
  const name = v.platform.toLowerCase();
  return loadEntries().some(
    (e) =>
      e.id !== ignoreId &&
      e.platform.trim().toLowerCase() === name &&
      e.weekStart === v.weekStart &&
      e.weekEnd === v.weekEnd,
  );
}

export function AddFlow() {
  const router = useRouter();
  const editId = useSearchParams().get("edit");
  const entries = useEntries();
  const editing = editId ? entries?.find((e) => e.id === editId) : undefined;
  const [step, setStep] = useState<Step>({ kind: "choose" });
  const [pending, setPending] = useState<Pending | null>(null);

  function save(draft: Draft, source: Entry["source"]) {
    addEntry({
      id: newId(),
      ...draftToValues(draft),
      source,
      sample: false,
      createdAt: new Date().toISOString(),
    });
  }

  /** Saves, or asks first when the same app and dates are already in the list. */
  function submit(draft: Draft, source: Entry["source"], after: () => void) {
    if (isDuplicate(draft)) {
      setPending({ draft, source, after });
      return;
    }
    save(draft, source);
    after();
  }

  // Next keeps this page's state alive after leaving it, so reset to the upload or
  // manual choice on every exit; otherwise the next visit reopens the last form.
  function reset() {
    setStep({ kind: "choose" });
    setPending(null);
  }

  function goHome() {
    reset();
    router.push("/");
  }

  function next(queue: ExtractedEntry[], index: number) {
    if (index + 1 < queue.length) setStep({ kind: "review", queue, index: index + 1 });
    else goHome();
  }

  return (
    <div>
      <Link
        href="/"
        onClick={reset}
        className="-ml-1 inline-flex h-10 items-center gap-1 text-sm font-medium text-muted hover:text-ink"
      >
        <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
        This month
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{editing ? "Edit entry" : "Add earnings"}</h1>

      <div className="mt-5 space-y-4">
        {pending && (
          <div className="rounded-xl border border-attention bg-attention-soft p-4" role="alert">
            <div className="flex gap-3">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-attention" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="font-medium">Looks like this week is already added.</p>
                <p className="mt-1 text-sm text-muted">
                  {draftToValues(pending.draft).platform},{" "}
                  {rangeLabel(pending.draft.weekStart, pending.draft.weekEnd)}. Adding it again counts it twice.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  save(pending.draft, pending.source);
                  const after = pending.after;
                  setPending(null);
                  after();
                }}
                className="h-11 rounded-lg border border-line bg-surface px-4 text-[15px] font-medium hover:bg-bg"
              >
                Add anyway
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="h-11 rounded-lg bg-ink px-4 text-[15px] font-semibold text-white"
              >
                Don&apos;t add
              </button>
            </div>
          </div>
        )}

        {!pending && !editId && step.kind === "choose" && (
          <>
            <UploadPanel
              onRead={(entries) => setStep({ kind: "review", queue: entries, index: 0 })}
              onError={(error) => setStep({ kind: "error", error })}
            />
            <button
              type="button"
              onClick={() => setStep({ kind: "manual" })}
              className="h-12 w-full rounded-lg border border-line bg-surface px-4 text-[15px] font-medium hover:bg-bg"
            >
              Enter manually
            </button>
          </>
        )}

        {!pending && !editId && step.kind === "review" && (
          <ReviewCard
            key={step.index}
            initial={draftFromExtracted(step.queue[step.index])}
            title={
              step.queue.length > 1
                ? `Check what we read (${step.index + 1} of ${step.queue.length})`
                : "Check what we read"
            }
            note="Fix anything that looks wrong. Nothing counts until you add it."
            submitLabel="Add to month"
            onSubmit={(draft) => submit(draft, "screenshot", () => next(step.queue, step.index))}
            onCancel={() => next(step.queue, step.index)}
          />
        )}

        {!pending && !editId && step.kind === "manual" && (
          <ReviewCard
            initial={emptyDraft}
            title="Enter a week"
            note="Use the totals from your app for one week. Active time is time on trips, deliveries or jobs."
            submitLabel="Add to month"
            onSubmit={(draft) => submit(draft, "manual", goHome)}
            onCancel={() => setStep({ kind: "choose" })}
          />
        )}

        {editId && entries && !editing && (
          <p className="text-sm text-muted">
            This entry is no longer saved on this device.{" "}
            <Link href="/" onClick={reset} className="font-medium text-accent underline underline-offset-2">
              Back to this month
            </Link>
          </p>
        )}

        {editing && (
          <ReviewCard
            key={editing.id}
            initial={draftFromEntry(editing)}
            title={editing.platform}
            submitLabel="Save changes"
            onSubmit={(draft) => {
              updateEntry({ ...editing, ...draftToValues(draft) });
              goHome();
            }}
            onCancel={goHome}
          />
        )}

        {!pending && !editId && step.kind === "error" && (
          <div className="rounded-xl border border-line bg-surface p-5" role="alert">
            <p className="font-medium">{ERRORS[step.error]}</p>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setStep({ kind: "choose" })}
                className="h-11 rounded-lg bg-accent px-4 text-[15px] font-semibold text-white hover:bg-accent-strong"
              >
                Try another screenshot
              </button>
              <button
                type="button"
                onClick={() => setStep({ kind: "manual" })}
                className="h-11 rounded-lg border border-line px-4 text-[15px] font-medium hover:bg-bg"
              >
                Enter manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
