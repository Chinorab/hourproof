---
doc: spec
status: approved
---

# HourProof (working name) — Technical Spec

## How This Works, In Plain Language

HourProof is one web app with two halves.

- **The part on the phone (the browser).** It shows every screen, keeps the person's entries in `localStorage` (a small notebook the browser keeps for this one site, on this one device), and does all the math: proration, month totals, which test is closer, days left. Nothing about the month's numbers ever leaves the phone.
- **One small server route, `/api/extract`.** It's the only piece that runs on a server. When someone uploads a screenshot, the phone shrinks the image and sends it to this route. The route forwards it to Claude (running on Amazon Bedrock) with a strict description of the fields we want back (platform, dates, active hours, earnings), gets structured data back, and returns it to the phone. It keeps no copy of the image. It exists because the AWS credentials must stay secret on the server, never in the browser.

The monthly summary is just a page styled for printing; the phone's own "Print / Save as PDF" turns it into a PDF. No PDF library, no database, no accounts.

Why this shape: it proves the kernel (screenshot in, numbers out, honest progress) with exactly one external service (Claude on Amazon Bedrock) and one hosting target (Vercel). Everything that would need more infrastructure (accounts, sync, history, state portals) is outside the proof of concept.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. The person opens the app → the browser loads the **This Month** page → it reads saved entries from `localStorage` → the month math in `lib/month.ts` computes totals for the current month → the page shows the dominant number, the secondary test, days left and the entries list (or the empty state).
2. They tap **Add earnings** → **Add earnings** page → they pick a screenshot.
3. The browser shrinks the image (longest side 2000 px, JPEG) → sends it as base64 to `POST /api/extract`.
4. The route checks the type and size → calls Claude Opus 5.5 on Bedrock with the image, today's date, and a Zod schema → Claude returns `{ is_earnings_summary, entries[] }` with `null` for anything it can't read → the route returns that JSON. The image is dropped when the request ends.
5. The browser shows one **review card** per entry, prefilled. Empty fields are highlighted; the person fixes or confirms, optionally adds business expenses, and taps **Add to month**.
6. The entry is saved to `localStorage` → back on **This Month**, `lib/month.ts` recomputes: prorates weeks that cross a month boundary, totals active hours and earnings after expenses, picks the test closer to its line, and computes the gaps.
7. **Monthly summary** reads the same entries and the same math, renders a print layout, and the browser's print dialog saves it as PDF.

```
 Phone (browser)                                   Server (Vercel)            Anthropic
┌───────────────────────────────┐   base64 image  ┌──────────────────┐  image  ┌─────────┐
│ Add earnings → shrink image   │ ──────────────> │ POST /api/extract│ ──────> │ Bedrock │
│ Review cards  <─ JSON entries │ <────────────── │ validate, no log │ <────── │ Claude  │
│ localStorage (entries)        │                 └──────────────────┘   JSON  └─────────┘
│ lib/month.ts (all the math)   │
│ This Month · Summary · Privacy│
└───────────────────────────────┘
```

## Stack

All choices agreed with the learner in `4-spec`.

- **Next.js (App Router) + TypeScript**, latest stable at scaffold time via `create-next-app`. One app for pages and the one server route; zero-config on Vercel. Docs: https://nextjs.org/docs
- **Tailwind CSS v4** for styling (installed by `create-next-app`). Docs: https://tailwindcss.com/docs
- **`@anthropic-ai/bedrock-sdk`** (`AnthropicBedrockMantle`, the official Claude SDK for Amazon Bedrock, which extends `@anthropic-ai/sdk`) + **`zod`** for the extraction schema via `betaZodOutputFormat` from `@anthropic-ai/sdk/helpers/beta/zod`. Bedrock docs: https://platform.claude.com/docs/en/build-with-claude/claude-on-amazon-bedrock Docs: https://platform.claude.com/docs/en/build-with-claude/vision , https://platform.claude.com/docs/en/build-with-claude/structured-outputs , https://github.com/anthropics/anthropic-sdk-typescript
- **`lucide-react`** icon set (no emojis). Docs: https://lucide.dev/guide/packages/lucide-react
- **Public Sans** via `next/font/google` (open source typeface from the US Web Design System; plain, civic, trustworthy). https://fonts.google.com/specimen/Public+Sans
- **Vitest** for unit tests of the month math (proration, totals, dominant test, days left). Docs: https://vitest.dev
- **playwright-cli** (learner's installed skill) to verify each build slice end to end in a real browser, mobile viewport included.
- **Model: Claude Opus 5.5 on Amazon Bedrock** (`anthropic.claude-opus-5-5`, overridable with `BEDROCK_MODEL_ID`), chosen by the learner over Sonnet 5.5 for the strongest high-resolution vision, and billed to the learner's AWS account to use their AWS credits (changed during `5-build`, see `checklist.md > Revisions`).

Verify early in the build: the Bedrock model ID for Claude Opus 5.5 in the chosen region, and that `client.beta.messages.parse` with `betaZodOutputFormat` works through `AnthropicBedrockMantle` (see `External Services and Dependencies > Claude API on Amazon Bedrock`).

## Where It Runs and How Someone Tries It

- **Runtime:** Node.js 20+ locally; Vercel (Node runtime) in production. Modern mobile browser on the client.
- **Secrets:** in `.env.local` (gitignored): `AWS_REGION`, plus either `AWS_BEARER_TOKEN_BEDROCK` (a Bedrock API key) or `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for an IAM user limited to Bedrock model invocation. Optional `BEDROCK_MODEL_ID`. `.env.example` lists the names only.
- **Start locally:** `npm install`, copy `.env.example` to `.env.local` and fill in the AWS values, then `npm run dev` and open http://localhost:3000 (use the browser's mobile view).
- **Tests:** `npm test` (Vitest).
- **Deployment (learner's choice):** Vercel, connected to the public GitHub repo; set the same AWS variables in the Vercel project's environment variables; every push to `main` deploys. Deployment is optional for the hackathon and does not replace the demo video or the public repo.
- **Demo recording (`6-ship`):** on the deployed URL (or localhost) in a phone-sized viewport: empty month → **Try with sample data** → screenshots read → review → big number moves → monthly summary → save as PDF. Sample data only; no real platform names on screen.
- **Cost guard:** an AWS Budgets alert on the account, and IAM permissions limited to invoking the Claude model.

## Look and Feel
Carries forward `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.

- **Feel:** calm, trustworthy, spacious; a well-made banking or tax app. Single column on mobile (max width about 480 px, centered on desktop), 16 px side gutters.
- **Palette (CSS variables in `globals.css`, light theme only for the proof of concept):**
  - background `#F6F6F3` (warm off-white), surface `#FFFFFF`, border `#E2E3DF`
  - text `#1B1E21`, muted text `#5A6067`
  - accent (progress, primary button) `#0E6655` (deep green); met state uses the accent plus a check icon
  - attention (fields to review) `#9A5B00`, error `#B42318`
  - No purple, no gradients.
- **Typography:** Public Sans. The dominant number is large (about 56 px, semibold) with `font-variant-numeric: tabular-nums`; headings short and plain; body 16 px minimum.
- **Shapes:** buttons and inputs 8 px radius (never pill-shaped); cards 12 px radius, 1 px border, no heavy shadows. Progress bar 8 px tall, square ends rounded 4 px.
- **Copy rules:** plain US English, short headlines, no dashes in UI copy, no emojis, no generic AI marketing copy, no "AI-powered" anywhere. Never "eligible" or "keep your coverage".
- **Icons:** `lucide-react` only, 20 px, stroke 1.75.
- **Favicon:** simple monogram mark in the accent color (`app/icon.svg` + `app/apple-icon.png`), done before the first deploy.
- **Build skills:** apply `design-taste-frontend` and `web-design-guidelines` during the UI slices; `design-md-library` may inform tokens but must not override the rules above.

## Components

### App layout
`app/layout.tsx`. Loads Public Sans, global styles, the header (app name) and footer (Privacy link, "Not a government site" line). Wraps every page in the single column container.
PRD ref: `prd.md > Screens and Layout`.

### This Month page
`app/page.tsx` (client component). Reads entries via `lib/storage.ts`, computes with `lib/month.ts`, renders:
- **Month header** — month name, a toggle between current and previous month, days left or "This month has ended".
- **Dominant progress** (`components/DominantProgress.tsx`) — the test closer to its line, big number ("62.5 of 80 hours" / "$412 of $580"), progress bar, gap ("17.5 hours to go") or met state ("80 hours reached").
- **Secondary test** (`components/SecondaryTest.tsx`) — the other test, smaller, same gap/met logic, with the household income note on the income test.
- **Entries list** (`components/EntriesList.tsx`) — platform, dates, hours and earnings after expenses counted this month, "Prorated" tag, edit and remove actions.
- **Actions** — **Add earnings** (primary), **Monthly summary**, **Try with sample data**.
- **Honesty note** (`components/HonestyNote.tsx`) and **Sample data banner** (`components/SampleBanner.tsx`) when sample entries exist, with **Clear sample data**.
- **Clear my data** at the bottom (confirm dialog).
PRD ref: `prd.md > Month totals and progress`, `prd.md > Entries list`, `prd.md > Honesty note`, `prd.md > States and Boundaries`.

### Add earnings page
`app/add/page.tsx` (client component), also used for editing (`/add?edit=<id>`).
- **Upload panel** (`components/UploadPanel.tsx`) — file input `accept="image/png,image/jpeg,image/webp"`, shrinks the image in a canvas (`lib/image.ts`: longest side 2000 px, JPEG quality 0.85), posts to `/api/extract`, shows the reading state with **Cancel** (aborts the request).
- **Review cards** (`components/ReviewCard.tsx`) — one per extracted entry; fields: platform name, week start, week end, active hours, earnings, business expenses (optional, default 0). Null fields are empty and highlighted with a hint ("Active time is what counts"). **Add to month** disabled until valid. Duplicate check (same platform, case-insensitive, and same dates) shows a warning with **Add anyway**.
- **Manual form** — the same `ReviewCard` with empty fields.
- **Unreadable state** — "We couldn't find hours and earnings in this image." with **Try another screenshot** and **Enter manually**.
PRD ref: `prd.md > Add earnings from a screenshot`, `prd.md > Add earnings manually`, `prd.md > States and Boundaries`.

### Extraction route
`app/api/extract/route.ts` (Node runtime, `maxDuration = 60`). Accepts `{ image: base64, mediaType }`; rejects other types and payloads over 4 MB (decoded) with a 400 and a plain message. Calls `lib/extract.ts`. Never logs or stores the image. Maps failures to `{ error: "unreadable" | "too_large" | "unavailable" }`.
PRD ref: `prd.md > Add earnings from a screenshot`, `prd.md > Privacy`.

### Extraction logic
`lib/extract.ts` (server only). Builds the Claude request (see `External Services and Dependencies > Claude API`), validates the parsed output with the Zod schema, normalizes numbers (hours to 2 decimals, money to cents), and returns `{ is_earnings_summary, entries }`. Treats `stop_reason: "refusal"`, `parsed_output === null`, or `is_earnings_summary: false` as unreadable.
PRD ref: `prd.md > Add earnings from a screenshot`.

### Month math
`lib/month.ts` (pure functions, unit tested). Implements:
- `overlapDays(entry, month)` and proration: counted = value × (days of the entry inside the month ÷ total days of the entry), dates inclusive, device local dates.
- `monthTotals(entries, month)` → active hours, earnings, expenses, earnings after expenses (floored at 0 per entry).
- `dominantTest(totals)` → `hours` if hours/80 ≥ net/580, else `income`.
- `gap(totals)` and met flags against `lib/thresholds.ts`.
- `daysLeft(month, today)` → calendar days after today for the current month; `ended` for the previous month.
PRD ref: `prd.md > Month totals and progress`, `prd.md > Weeks that span two months`.

### Thresholds
`lib/thresholds.ts`. `HOURS_THRESHOLD = 80`, `FEDERAL_MIN_WAGE = 7.25`, `INCOME_THRESHOLD = 580` (80 × 7.25), with a comment citing the sources in `Decisions and Open Issues > Thresholds and income definition`. The only place these numbers live.
PRD ref: `prd.md > Honesty note`.

### Storage
`lib/storage.ts`. Reads and writes the entries array under the key `hourproof:v1:entries`, every access wrapped in try/catch. If storage is unavailable (private browsing, blocked), the app keeps entries in memory for the session and shows "Your entries can't be saved on this device." Also `clearAll()` and `clearSample()`.
PRD ref: `prd.md > Privacy`, `prd.md > States and Boundaries`.

### Sample data
`public/samples/` holds three clearly labeled sample screenshots (each image carries a visible "SAMPLE" mark) from fictional platforms, in deliberately different layouts, plus one non-earnings image for the unreadable path (used in testing only). Built during the build from small HTML mockups rendered to PNG with Playwright. Fictional names are checked against real brands before use. **Try with sample data** fetches the three images and sends each through the real `/api/extract` path (the kernel is never faked); resulting entries are saved with `sample: true` and dated in the current month.
PRD ref: `prd.md > Sample data`.

### Monthly summary page
`app/summary/page.tsx` with `components/MonthlySummary.tsx` (client component, `?month=YYYY-MM`). Title, month, generated date, entries table (platform, dates, active hours counted, earnings, expenses, earnings after expenses, prorated marker), totals, both thresholds with the numbers (reached or gap), honesty note with the Medicaid.gov link, "Sample data" label when applicable. **Print or save as PDF** calls `window.print()`. Print styles: `@page { size: letter; margin: 0.6in }` in `app/globals.css` and Tailwind `print:` variants that hide navigation and buttons and show the Earnings and Expenses columns; fits one page for a typical month.
PRD ref: `prd.md > Monthly summary`.

### Privacy page
`app/privacy/page.tsx` (static). A few plain sentences: screenshots are sent to Anthropic's Claude API to be read and are not stored by HourProof; entries (numbers only) are kept in this browser on this device; there are no accounts; **Clear my data** removes them; links to Anthropic's commercial terms and privacy policy (https://www.anthropic.com/legal/commercial-terms, https://www.anthropic.com/legal/privacy).
PRD ref: `prd.md > Privacy`.

### Honesty note
`components/HonestyNote.tsx`. One short sentence plus link, reused on This Month and the summary: "These are your numbers compared with the federal thresholds. Only your state Medicaid agency decides." Link: https://www.medicaid.gov. The income test adds: "Your state looks at your household income. This only counts your gig earnings after expenses."
PRD ref: `prd.md > Honesty note`.

## Data Model

```ts
type Entry = {
  id: string;            // crypto.randomUUID()
  platform: string;      // as read or typed
  weekStart: string;     // "YYYY-MM-DD"
  weekEnd: string;       // "YYYY-MM-DD", >= weekStart
  activeHours: number;   // >= 0, active time only
  earnings: number;      // >= 0, USD, tips included
  expenses: number;      // >= 0, USD, default 0, entered by the person
  source: "screenshot" | "manual";
  sample: boolean;       // true for sample data
  createdAt: string;     // ISO timestamp
};
```

| Data | Where it lives | How it changes | Leave and come back |
|---|---|---|---|
| Entries | `localStorage` key `hourproof:v1:entries` (JSON array) | Add, edit, remove, clear sample, clear all | Still there on the same device and browser |
| Month totals, dominant test, gaps, days left | Computed on each render by `lib/month.ts` | Recomputed from entries and today's date | Recomputed for today |
| Selected month | URL or component state (current or previous) | Toggle | Defaults to current month |
| Screenshot | Memory only, during the upload request | Discarded after reading | Gone; never stored |
| Extraction result before **Add to month** | Component state | Edited on the review card | Lost if the person leaves (intended) |

## File Structure

```
hourproof/
├── app/
│   ├── layout.tsx            # font, header, footer, single column shell
│   ├── globals.css           # Tailwind + color tokens
│   ├── icon.svg              # favicon (H monogram in the accent color)
│   ├── apple-icon.png        # home screen icon
│   ├── page.tsx              # This Month
│   ├── add/page.tsx          # Add earnings: upload, review, manual, edit
│   ├── summary/page.tsx      # Monthly summary
│   ├── privacy/page.tsx      # Privacy page
│   └── api/extract/route.ts  # the only server route: screenshot -> Claude -> JSON
├── components/
│   ├── DominantProgress.tsx
│   ├── SecondaryTest.tsx
│   ├── EntriesList.tsx
│   ├── UploadPanel.tsx
│   ├── AddFlow.tsx           # add, review, manual entry, edit, duplicate warning
│   ├── MonthlySummary.tsx
│   ├── ReviewCard.tsx
│   ├── HonestyNote.tsx
│   └── SampleBanner.tsx
├── lib/
│   ├── thresholds.ts         # 80 h, $7.25, $580 with source citation
│   ├── month.ts              # proration, totals, dominant test, gaps, days left
│   ├── month.test.ts         # Vitest unit tests
│   ├── storage.ts            # localStorage with safe fallback
│   ├── image.ts              # client side resize to JPEG
│   ├── read.ts               # client call to /api/extract with timeout
│   ├── format.ts             # money and hours formatting
│   ├── extract.ts            # server side Claude call + Zod schema
│   └── sample.ts             # loads sample screenshots
├── public/samples/           # labeled sample screenshots (fictional platforms)
├── scripts/make-samples/     # HTML mockups + script that renders them to PNG
├── devpost/                  # Devpost learning workspace (planning docs)
├── .env.example              # AWS_REGION, Bedrock credentials (names only)
├── .gitignore
├── LICENSE                   # MIT
├── README.md                 # what, why, run, deploy, privacy, sources
├── package.json
└── vitest.config.ts
```

## External Services and Dependencies

### Claude API on Amazon Bedrock
- **Client:** `new AnthropicBedrockMantle()` from `@anthropic-ai/bedrock-sdk` in `lib/extract.ts`, server only. It targets `https://bedrock-mantle.{region}.api.aws/anthropic` and exposes the same `beta.messages` surface as the first party SDK.
- **Call:** `client.beta.messages.parse(...)`
  - `model: "anthropic.claude-opus-5-5"` (or `BEDROCK_MODEL_ID`), `max_tokens: 8000`
  - `output_config: { effort: "low", format: zodOutputFormat(ExtractionSchema) }` (raise effort to `"medium"` only if the sample screenshots show misses)
  - No server side `fallbacks`: not available on Bedrock. A refusal is treated as an unreadable screenshot.
  - `messages: [{ role: "user", content: [ { type: "image", source: { type: "base64", media_type: "image/jpeg", data } }, { type: "text", text: <instructions + today's date> } ] }]`
  - No `thinking` disable, no assistant prefill, no `temperature` (not accepted on this model).
- **Schema (`ExtractionSchema`):**
  ```ts
  z.object({
    is_earnings_summary: z.boolean(),
    entries: z.array(z.object({
      platform_name: z.string().nullable(),
      week_start: z.string().nullable(),    // YYYY-MM-DD
      week_end: z.string().nullable(),      // YYYY-MM-DD
      active_hours: z.number().nullable(),  // active / on-trip time only
      online_hours: z.number().nullable(),  // read but never counted
      earnings_total: z.number().nullable() // USD, tips included
    }))
  })
  ```
- **Instructions (summary):** read only what is visible; use `null` instead of guessing; active time means time on trips or tasks, not online time; if the year is missing, infer it from today's date (passed in) and the weekday labels; one entry per platform and week shown; if the image is not a gig earnings summary, set `is_earnings_summary: false` and return no entries.
- **Images:** JPEG/PNG/WebP/GIF accepted; Opus 5.5 reads up to 2576 px on the long edge. We send at most 2000 px JPEG to keep requests small (well under the Vercel request body limit, about 4.5 MB; verify at build).
- **Auth:** resolved by the SDK from the environment: `AWS_BEARER_TOKEN_BEDROCK`, else `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`; region from `AWS_REGION`. Model access for Claude Opus 5.5 must be enabled in the Bedrock console for that region.
- **Cost:** Bedrock pricing for Claude Opus 5.5 in the chosen region (https://aws.amazon.com/bedrock/pricing/); at first party rates a screenshot is roughly 1 to 2 cents. Whether AWS promotional credits apply depends on the credit terms; the learner checks this in AWS Billing.
- **Rate limits:** Bedrock quotas for the account and region; the SDK retries 429 and 5xx twice by default.
- **Data handling:** inputs are processed by Amazon Bedrock under AWS terms; HourProof stores nothing server side. Exact policy link confirmed at build for the Privacy page.
- **Docs:** https://platform.claude.com/docs/en/build-with-claude/claude-on-amazon-bedrock , https://platform.claude.com/docs/en/build-with-claude/vision , https://platform.claude.com/docs/en/build-with-claude/structured-outputs , https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html

### Vercel
Hosting for the app and the one route. Free Hobby plan is enough. Env var set in the project settings. Docs: https://vercel.com/docs/frameworks/nextjs , https://vercel.com/docs/functions/limitations

## Important Failure Modes

- **Screenshot can't be read** (not an earnings screen, blurry, refusal, schema parse fails) → "We couldn't find hours and earnings in this image." with **Try another screenshot** and **Enter manually**.
- **Claude is slow or unavailable** (network, 5xx after retries, 60 s limit) → reading state with **Cancel**; on failure: "Reading is not available right now. You can enter this week by hand." with **Enter manually**.
- **Partly read** (some fields `null`) → those fields empty and highlighted; **Add to month** stays disabled until filled.
- **Image too large** → resized in the browser first; if still rejected: "This image is too large. Try a smaller screenshot."
- **Storage unavailable** → entries kept for the session only, with a visible notice.

## What Was Simplified and Why

- **Entries in `localStorage`** instead of accounts and a database — the weekly loop only needs the numbers to stay on the person's phone. The fuller version would need sign in, a hosted database and sync.
- **Browser print to PDF** instead of a PDF library — same one page result, no dependency. The fuller version would generate a signed PDF on the server.
- **Optional expenses typed by the person** instead of mileage tracking or tax style calculations — enough to keep the $580 comparison honest. The fuller version would import mileage and categorize expenses.
- **Household income shown as a note, not modeled** — CMS uses household MAGI; modeling other household members is outside the proof of concept.
- **Seasonal worker six month average not modeled** — a different calculation for a subset of workers; deferred.
- **Other qualifying activities (community service, school, work programs) not tracked** — the kernel is gig work; deferred per `prd.md > Deferred From the POC`.
- **No server rate limiter** — a spend limit on the Anthropic key caps cost for a demo. The fuller version would add per user rate limiting.
- **Current and previous month only** — enough to finish last month's summary early in a new month; a full history is a later enhancement.

## Decisions and Open Issues

### Decisions (learner, `4-spec`)
- **Stack:** Next.js + TypeScript + Tailwind, one server route, `localStorage`, browser print to PDF, Vercel. Tradeoff accepted: no cross device sync.
- **Income for the $580 test:** earnings minus optional business expenses, with a household income note. Tradeoff accepted: one extra optional field per entry.
- **Model:** Claude Opus 5.5 for screenshot reading. Tradeoff accepted: about twice the cost of Sonnet 5.5.
- **Provider:** both supported, chosen by environment. With `ANTHROPIC_API_KEY` set, the first party Claude API (`claude-opus-5-5`, server side `fallbacks: "default"`); otherwise Amazon Bedrock (`AnthropicBedrockMantle`). Decided in `5-build` after the learner's AWS account was denied access to Claude Opus 5.5 on Bedrock; the Bedrock path stays for when access is granted.
- **Deployment:** Vercel, as stated in the learner's brief.

### Implementation details derived from those decisions (agent)
- Image resize to 2000 px JPEG before upload; effort `low`; Public Sans and the palette above; Vitest for month math.

### Thresholds and income definition
Verified on 2026-10-06 against official sources:
- 80 hours per month of qualifying activities, which can be combined; work includes self employment and gig work. CMS fact sheet, CMS-2454-IFC (June 1, 2026): https://www.cms.gov/newsroom/fact-sheets/medicaid-community-engagement-requirement-certain-individuals-interim-final-rule-comment-period-cms
- Income alternative: monthly income not less than the federal minimum wage × 80 hours, "$7.25 (in 2026) x 80 = $580 per month"; states must use the federal minimum wage, not state or local. Medicaid.gov IFC overview deck, slides 11 and 13, 42 CFR § 435.552: https://www.medicaid.gov/medicaid/downloads/ce-requirement-ifc-deck.pdf
- Income is MAGI based monthly household income (slide 13). States may also convert income to hours by dividing by $7.25 when hours are not documented (§ 435.552(f), (g)).
- States must implement no later than January 1, 2027.
- Federal Register rule text: https://www.federalregister.gov/documents/2026/06/03/2026-11094/medicaid-program-community-engagement-requirement-for-certain-individuals

### Learner uncertainty: getting reliable numbers out of different screenshots
Tied to the learner's goal ("master the Claude vision API"). The question: how do you get dependable fields from screenshots whose layouts differ between apps, that may omit the year, and that show both online and active time?
What clarifies it: structured outputs with a Zod schema (Claude must answer in that exact shape), nullable fields so "not visible" becomes `null` instead of a guess, today's date in the prompt for the year, and the review step so nothing counts unchecked.
Agreed investigation during the build: run the three sample screenshots (different layouts, one showing both online and active time, one without a year) plus the non-earnings image through `/api/extract`. Evidence: correct fields, `null` where data is missing, active time chosen over online time, and the non-earnings image rejected.

### Open issues
- **Project name** — HourProof remains the working name; can change before `6-ship`.
- **Verify at build:** the Bedrock model ID for Claude Opus 5.5 in the chosen region; Vercel request body limit; AWS Bedrock data privacy URL for the Privacy page; fictional sample platform names are not real brands.
