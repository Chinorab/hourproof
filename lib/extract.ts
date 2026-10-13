import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { ExtractedEntry } from "./types";

// Claude Opus 5.5. With ANTHROPIC_API_KEY set, the first party Claude API is used;
// otherwise Amazon Bedrock (AWS_REGION plus AWS_BEARER_TOKEN_BEDROCK or IAM keys).
// Credentials only ever come from the environment.
const useAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
export const MODEL = useAnthropic
  ? "claude-opus-5-5"
  : process.env.BEDROCK_MODEL_ID || "anthropic.claude-opus-5-5";

const ExtractionSchema = z.object({
  is_earnings_summary: z
    .boolean()
    .describe("True only if the image is an earnings summary from a gig work app."),
  entries: z.array(
    z.object({
      platform_name: z.string().nullable().describe("App or platform name as shown."),
      week_start: z.string().nullable().describe("First day covered, YYYY-MM-DD."),
      week_end: z.string().nullable().describe("Last day covered, YYYY-MM-DD."),
      active_hours: z
        .number()
        .nullable()
        .describe("Active time in decimal hours: time on trips, deliveries or jobs. Never online time."),
      online_hours: z.number().nullable().describe("Online or logged in time in decimal hours, if shown."),
      earnings_total: z.number().nullable().describe("Total earnings in US dollars for the period, tips included."),
    }),
  ),
});

function instructions(today: string) {
  return `You read screenshots of weekly earnings summaries from gig work apps (delivery, rideshare, cleaning, odd jobs).

Today's date is ${today}.

Return what the image shows, using the schema:
- Report only values that are visible. If a value is not shown, use null. Never estimate or guess.
- active_hours is time actively working: on trips, deliveries, tasks or jobs. If the image shows both active time and online time, put active time in active_hours and online time in online_hours. If only online time is shown, active_hours is null.
- If hours are listed per job and a weekly total is shown, use the weekly total. If only per job hours are shown, add them up.
- Convert durations like "14h 35m" to decimal hours (14.58).
- earnings_total is the total for the period including tips and incentives, before any expenses.
- Dates are YYYY-MM-DD. If the year is not shown, pick the year that puts the period closest to, and not after, today's date. If only a start date is shown ("Week of ..."), the period is 7 days, so week_end is 6 days later.
- One entry per platform and period shown.
- If the image is not a gig work earnings summary, set is_earnings_summary to false and return an empty entries array.`;
}

const round = (n: number | null, digits: number) =>
  n === null || !Number.isFinite(n) ? null : Number(n.toFixed(digits));

const isoDate = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);

export type ExtractResult =
  | { kind: "ok"; entries: ExtractedEntry[] }
  | { kind: "unreadable" }
  | { kind: "unavailable" };

export async function extractEarnings(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  today: string,
): Promise<ExtractResult> {
  let response;
  try {
    const client = useAnthropic ? new Anthropic() : new AnthropicBedrockMantle();
    response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 8000,
      // Server side fallback on a policy decline exists on the Claude API only, not on Bedrock.
      ...(useAnthropic ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      output_config: { effort: "low", format: betaZodOutputFormat(ExtractionSchema) },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: instructions(today) },
          ],
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.BadRequestError) return { kind: "unreadable" };
    // Auth, rate limit, server and connection errors: reading is unavailable right now.
    console.error("extract: Claude request failed", err instanceof Anthropic.APIError ? err.status : (err as Error).name);
    return { kind: "unavailable" };
  }

  if (response.stop_reason === "refusal" || !response.parsed_output) return { kind: "unreadable" };
  const out = response.parsed_output;
  if (!out.is_earnings_summary || out.entries.length === 0) return { kind: "unreadable" };

  return {
    kind: "ok",
    entries: out.entries.map((e) => ({
      platform_name: e.platform_name?.trim() || null,
      week_start: isoDate(e.week_start),
      week_end: isoDate(e.week_end),
      active_hours: round(e.active_hours, 2),
      online_hours: round(e.online_hours, 2),
      earnings_total: round(e.earnings_total, 2),
    })),
  };
}
