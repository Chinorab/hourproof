"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UploadPanel, type ReadError } from "@/components/UploadPanel";
import { ReviewCard, draftFromExtracted, draftToValues, emptyDraft, type Draft } from "@/components/ReviewCard";
import { addEntry } from "@/lib/storage";
import type { ExtractedEntry } from "@/lib/types";

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

export default function AddPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ kind: "choose" });

  function save(draft: Draft, source: "screenshot" | "manual") {
    addEntry({
      id: crypto.randomUUID(),
      ...draftToValues(draft),
      source,
      sample: false,
      createdAt: new Date().toISOString(),
    });
  }

  function next(queue: ExtractedEntry[], index: number) {
    if (index + 1 < queue.length) setStep({ kind: "review", queue, index: index + 1 });
    else router.push("/");
  }

  return (
    <div>
      <Link href="/" className="-ml-1 inline-flex h-10 items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
        This month
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add earnings</h1>

      <div className="mt-5 space-y-4">
        {step.kind === "choose" && (
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

        {step.kind === "review" && (
          <ReviewCard
            key={step.index}
            initial={draftFromExtracted(step.queue[step.index])}
            title={step.queue.length > 1 ? `Check what we read (${step.index + 1} of ${step.queue.length})` : "Check what we read"}
            note="Fix anything that looks wrong. Nothing counts until you add it."
            submitLabel="Add to month"
            onSubmit={(draft) => {
              save(draft, "screenshot");
              next(step.queue, step.index);
            }}
            onCancel={() => next(step.queue, step.index)}
          />
        )}

        {step.kind === "manual" && (
          <ReviewCard
            initial={emptyDraft}
            title="Enter a week"
            submitLabel="Add to month"
            onSubmit={(draft) => {
              save(draft, "manual");
              router.push("/");
            }}
            onCancel={() => setStep({ kind: "choose" })}
          />
        )}

        {step.kind === "error" && (
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
