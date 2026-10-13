---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (learner's stated preference in `learner-profile.md`)

## Slices

- [x] **1. A screenshot goes in, editable entries come out and are saved**
  Becomes usable: On a phone sized screen, the person uploads a weekly earnings screenshot, sees a reading state, gets a prefilled review card (platform, dates, active hours, earnings, optional expenses), taps Add to month, and sees the entry listed on This Month with plain running totals. Entries survive a reload.
  Why now: This is the kernel and the biggest risk (Claude vision returning the fields the spec assumes, through a Vercel style route). It also carries all bootstrapping and the learner's vision investigation, so bad news arrives first.
  PRD ref: `prd.md > The Core Journey` (steps 1 to 5), `prd.md > Add earnings from a screenshot`, `prd.md > Privacy`
  Spec ref: `spec.md > Stack`, `spec.md > Extraction route`, `spec.md > Extraction logic`, `spec.md > Add earnings page`, `spec.md > Storage`, `spec.md > Sample data`, `spec.md > External Services and Dependencies`, `spec.md > File Structure`
  Build: Scaffold Next.js + TypeScript + Tailwind per the file structure; `git init` already done; add `.env.example`, MIT `LICENSE`, Vitest config. Generate the three labeled sample screenshots (fictional platforms, different layouts) and one non-earnings image with `scripts/make-samples`. Implement `lib/image.ts`, `lib/extract.ts` (Zod schema, Claude Opus 5.5 on Bedrock, effort low), `app/api/extract/route.ts` (type and size checks, no logging), `components/UploadPanel.tsx`, `components/ReviewCard.tsx`, `app/add/page.tsx`, `lib/storage.ts`, and a minimal `app/page.tsx` that lists entries and sums hours and earnings.
  Verify (mechanical): `npm run build` passes; `npm run dev` starts clean; POST each sample image to `/api/extract` and confirm correct platform, dates, active hours (not online hours) and earnings, `null` where data is absent, and the non-earnings image returns unreadable; with playwright-cli at a 390 px wide viewport, upload a sample, see the review card, add it, reload, and confirm the entry and totals persist.
  Learner check: Run `npm run dev`, open http://localhost:3000 in your browser's phone view, upload one of the sample screenshots from `public/samples`, check what was read, add it, and reload the page.
  Commit: `Read earnings screenshots with Claude and save entries`

- [x] **2. The month answer: one big number, the gap, days left**
  Becomes usable: This Month shows the dominant test (whichever is closer to its line) as the big number with a progress bar and gap, the other test smaller, days left, prorated weeks tagged, earnings after expenses, the honesty note with the Medicaid.gov link, and the household income note. Entries can be added manually, edited and removed; duplicates warn; the previous month can be viewed. The calm visual system (Public Sans, palette, 8 px radius buttons, lucide icons) is applied.
  Why now: Turns read numbers into the answer the person came for; the month math is the second place correctness matters and is cheap to unit test now that real entries exist.
  PRD ref: `prd.md > Month totals and progress`, `prd.md > Weeks that span two months`, `prd.md > Entries list`, `prd.md > Add earnings manually`, `prd.md > Honesty note`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Month math`, `spec.md > Thresholds`, `spec.md > This Month page`, `spec.md > Honesty note`, `spec.md > Look and Feel`, `spec.md > Data Model`
  Build: `lib/thresholds.ts` with source citation; `lib/month.ts` and `lib/month.test.ts` (proration across months, expenses floor, dominant test, gaps and met states, days left, previous month ended); `DominantProgress`, `SecondaryTest`, `EntriesList`, `HonestyNote`; manual entry and edit mode on the add page; duplicate warning; month toggle; layout, font, color tokens and copy rules from `Look and Feel`, using design-taste-frontend and web-design-guidelines.
  Verify (mechanical): `npm test` passes (including a Sep 29 to Oct 5 entry counting 5/7 toward October and an entry whose expenses exceed earnings counting 0); `npm run build` passes; playwright-cli at 390 px: add a manual entry, edit it, remove it, confirm the big number switches between hours and income as entries change, the duplicate warning appears, and no UI text contains "eligible" or a dash.
  Learner check: Add two or three weeks by hand (one crossing into last month, one with expenses), watch the big number and gap change, edit one, remove one, and switch to the previous month.
  Commit: `Show month progress against federal thresholds`

- [ ] **3. Sample data and the awkward cases**
  Becomes usable: From an empty month, Try with sample data reads the three labeled sample screenshots through the real extraction path and fills the month, with a visible Sample data banner and Clear sample data. Unreadable, partly read, slow or unavailable reading, oversized images and blocked storage each show the planned plain message and a way forward. Clear my data empties the device.
  Why now: Makes the demo path work in one tap and hardens the failure modes before the summary depends on clean data.
  PRD ref: `prd.md > Sample data`, `prd.md > States and Boundaries`, `prd.md > Privacy`
  Spec ref: `spec.md > Sample data`, `spec.md > Important Failure Modes`, `spec.md > Storage`, `spec.md > This Month page`
  Build: `lib/sample.ts` and the Try with sample data action (entries saved with `sample: true`, dated in the current month); `SampleBanner`; unreadable, partial, timeout and cancel, too large and unavailable states in `UploadPanel` and `ReviewCard`; storage unavailable notice; Clear my data with confirm; empty state for a new month.
  Verify (mechanical): `npm run build` passes; playwright-cli at 390 px: empty state renders; Try with sample data fills the month with the banner; upload the non-earnings image and see the unreadable message with Enter manually; a partly read result keeps Add to month disabled until filled; Clear sample data and Clear my data return to the empty state; with the API key unset, reading fails gracefully with the manual entry path.
  Learner check: Start from an empty month, tap Try with sample data, then try the non-earnings sample image, then clear everything.
  Commit: `Add sample data and handle reading failures`

- [ ] **4. The monthly summary, privacy page and favicon**
  Becomes usable: Monthly summary shows the month's entries table, totals, both thresholds as numbers, the honesty note and a Sample data label when relevant, and Print or save as PDF produces a clean single letter page. A short Privacy page explains what is sent, what is kept and how to clear it. The app has its favicon and home screen icon, and the README explains what it is, how to run it, privacy and sources.
  Why now: Closes the core journey with the proof the person keeps, and completes the trust pieces needed before anything goes live.
  PRD ref: `prd.md > Monthly summary`, `prd.md > Privacy`, `prd.md > The Core Journey` (steps 6 and 7)
  Spec ref: `spec.md > Monthly summary page`, `spec.md > Privacy page`, `spec.md > App layout`, `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`
  Build: `app/summary/page.tsx` and `print.css` (letter, hidden navigation); `app/privacy/page.tsx` with confirmed Anthropic policy links; `app/icon.svg` and `app/apple-icon.png`; footer links; `README.md` (what and why, run locally, env vars, deploy to Vercel, privacy, CMS sources, sample data note, license).
  Verify (mechanical): `npm run build` passes; playwright-cli at 390 px opens the summary with sample data and saves a PDF via print emulation, confirming one page, no buttons, the honesty note and the Sample data label; the privacy page renders from the footer link; the favicon is served; a final scan of `app/` and `components/` finds no "eligible", "AI-powered", emoji or dash in UI copy, and `git ls-files` shows no `.env.local` or learner profile.
  Learner check: Load sample data, open Monthly summary, use Print or save as PDF, and open the PDF; then open the Privacy page from the footer.
  Commit: `Add printable monthly summary and privacy page`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1: the learner uploads a sample screenshot on a phone sized view and reacts to the reading and review step, while there is still room to change extraction or review behavior. Learner tried it: "ça marche", no changes requested.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- Switched the Claude provider from the first party API to Amazon Bedrock (`AnthropicBedrockMantle`, model `anthropic.claude-opus-5-5`) — the learner chose to use their AWS credits; Bedrock has no server side fallbacks, so refusals map to unreadable. Updated `spec.md > Stack`, `Where It Runs and How Someone Tries It`, `External Services and Dependencies`, `Privacy page`, `Decisions and Open Issues`.
- Sample screenshots are fixed images dated Sep 28 to Oct 4, 2026 — static PNGs can't follow the calendar, so slice 3 shifts sample entries by whole weeks after reading to land in the most recent full week. Reading stays real.
- Added the first party Claude API back as the primary provider when `ANTHROPIC_API_KEY` is set, keeping Bedrock as the alternative — the learner's AWS account returned AccessDeniedException for Claude Opus 5.5 on Bedrock.
- The learner chose the first party Claude API (Claude Opus 5.5, prepaid credits, auto reload off) as the active provider — their AWS account only has Claude Haiku 4.5 on Bedrock; an AWS support case for Opus access is optional. Bedrock stays supported through `.env.local`.
