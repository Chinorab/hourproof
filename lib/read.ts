"use client";

import { shrinkImage } from "./image";
import { todayISO } from "./dates";
import type { ExtractedEntry, ExtractResponse } from "./types";

export type ReadError = "unreadable" | "too_large" | "unavailable";

const TIMEOUT_MS = 60_000;

/**
 * Sends one screenshot to /api/extract and returns what was read.
 * Throws only when the person cancels (the abort signal fires); every other
 * failure comes back as a ReadError the screen can explain.
 */
export async function readScreenshot(file: Blob, signal?: AbortSignal): Promise<ExtractedEntry[] | ReadError> {
  let image;
  try {
    image = await shrinkImage(file);
  } catch {
    return "unreadable"; // not a decodable image
  }
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: image.base64, mediaType: image.mediaType, today: todayISO() }),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (res.status === 413) return "too_large";
    const data = (await res.json()) as ExtractResponse;
    if (data.ok) return data.entries;
    if (data.error === "too_large") return "too_large";
    if (data.error === "unreadable" || data.error === "bad_request") return "unreadable";
    return "unavailable";
  } catch (err) {
    if (signal?.aborted) throw err;
    return "unavailable"; // network failure or the 60 second limit
  }
}
