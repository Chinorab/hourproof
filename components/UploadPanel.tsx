"use client";

import { useRef, useState } from "react";
import { ImageUp, LoaderCircle } from "lucide-react";
import { shrinkImage } from "@/lib/image";
import { todayISO } from "@/lib/dates";
import type { ExtractedEntry, ExtractResponse } from "@/lib/types";

export type ReadError = "unreadable" | "too_large" | "unavailable";

export async function readScreenshot(file: Blob, signal?: AbortSignal): Promise<ExtractedEntry[] | ReadError> {
  const { base64, mediaType } = await shrinkImage(file);
  try {
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64, mediaType, today: todayISO() }),
      signal,
    });
    const data = (await res.json()) as ExtractResponse;
    if (data.ok) return data.entries;
    if (data.error === "too_large") return "too_large";
    if (data.error === "unreadable" || data.error === "bad_request") return "unreadable";
    return "unavailable";
  } catch (err) {
    if (signal?.aborted) throw err;
    return "unavailable";
  }
}

type Props = {
  onRead: (entries: ExtractedEntry[]) => void;
  onError: (error: ReadError) => void;
};

export function UploadPanel({ onRead, onError }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [reading, setReading] = useState(false);

  async function handleFile(file: File) {
    controller.current = new AbortController();
    setReading(true);
    try {
      const result = await readScreenshot(file, controller.current.signal);
      if (Array.isArray(result)) onRead(result);
      else onError(result);
    } catch {
      // Cancelled by the person: go back to the upload choice.
    } finally {
      setReading(false);
      controller.current = null;
      if (input.current) input.current.value = "";
    }
  }

  if (reading) {
    return (
      <div className="rounded-xl border border-line bg-surface p-5" role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <LoaderCircle className="size-5 animate-spin text-accent" strokeWidth={1.75} aria-hidden />
          <p className="font-medium">Reading your screenshot…</p>
        </div>
        <p className="mt-2 text-sm text-muted">This usually takes a few seconds.</p>
        <button
          type="button"
          onClick={() => controller.current?.abort()}
          className="mt-4 h-11 rounded-lg border border-line px-4 text-[15px] font-medium hover:bg-bg"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        id="screenshot"
        onChange={(ev) => {
          const file = ev.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <label
        htmlFor="screenshot"
        className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[16px] font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        <ImageUp className="size-5" strokeWidth={1.75} aria-hidden />
        Upload a screenshot
      </label>
      <p className="mt-2 text-sm text-muted">
        A weekly earnings summary from any gig app. The image is read, then discarded.
      </p>
    </div>
  );
}
