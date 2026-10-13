import { extractEarnings } from "@/lib/extract";
import type { ExtractResponse } from "@/lib/types";

export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type MediaType = (typeof TYPES)[number];

const json = (body: ExtractResponse, status = 200) => Response.json(body, { status });

// Screenshots are read and discarded. Nothing about the image is stored or logged.
export async function POST(request: Request) {
  let body: { image?: unknown; mediaType?: unknown; today?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const { image, mediaType, today } = body;
  if (typeof image !== "string" || !TYPES.includes(mediaType as MediaType)) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  if (Math.floor((image.length * 3) / 4) > MAX_BYTES) {
    return json({ ok: false, error: "too_large" }, 413);
  }
  const date =
    typeof today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(today)
      ? today
      : new Date().toISOString().slice(0, 10);

  const result = await extractEarnings(image, mediaType as MediaType, date);
  if (result.kind === "ok") return json({ ok: true, entries: result.entries });
  if (result.kind === "unreadable") return json({ ok: false, error: "unreadable" }, 422);
  return json({ ok: false, error: "unavailable" }, 503);
}
