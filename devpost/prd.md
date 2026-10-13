---
doc: prd
status: approved
---

# HourProof — Product Requirements

A phone-first web app for gig and seasonal workers on Medicaid in expansion states: add this month's earnings from screenshots or by hand, see where the month stands against the federal 80-hour and $580 tests, and keep a one-page summary as proof.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. The person opens the app on their phone and lands on **This Month**. With no earnings yet, they see the month, days left, the two federal tests (80 active hours or $580), and one clear action: **Add earnings**. A secondary action lets them **Try with sample data**.
2. They tap **Add earnings** and choose **Upload a screenshot** (a weekly earnings summary from a gig app) or **Enter manually**.
3. For a screenshot, the app reads it and shows what it found: platform name, week dates, active hours, earnings. Every field is editable. Nothing counts until they tap **Add to month**.
4. Back on **This Month**, the dominant number updates. It shows whichever test is closer to its line (for example "62.5 of 80 hours"), with a progress bar, the gap ("17.5 hours to go"), and days left in the month. The other test is shown smaller underneath. Each added entry appears in a list.
5. They repeat each week as new earnings come in. Their numbers are still there when they come back, kept on their phone.
6. At any point, and especially at month's end, they open **Monthly summary**: a clean one-page view they can print or save as PDF.
7. Everywhere the numbers appear, a short visible note says the app shows numbers against federal thresholds, that only their state Medicaid agency decides, and links to Medicaid.gov.

Success: a screenshot goes in, the big number moves, the person knows exactly how far they are from the line, and they leave with a summary page.

## Screens and Layout

- **This Month** (home). Top: month name and days left. Center: the dominant number with a progress state. Below: the secondary test, then the list of entries (platform, dates, hours and income counted). Primary action **Add earnings**; secondary actions **Monthly summary** and **Try with sample data**. Honesty note with Medicaid.gov link always visible. Footer link to **Privacy**.
- **Add earnings**. Choice between upload and manual entry, then the **Review** step: one editable card per entry found, with **Add to month** and **Cancel**.
- **Monthly summary**. One printable page (see `Features and Behavior > Monthly summary`). Actions: **Print or save as PDF**, **Back**.
- **Privacy**. Short plain page (see `Features and Behavior > Privacy`).

Movement: everything starts from and returns to **This Month**. Single column, built for a phone first; works on desktop.

## Look and Feel
Source: `scope.md > Inspiration & Identity`.

- Calm and trustworthy, like a well-made banking or tax app. Not a startup landing page.
- One dominant number per screen with a clear progress state. Generous whitespace, single column on mobile.
- Short, plain headlines. Plain US English, no jargon.
- Icons from one icon set; no emojis.
- Buttons with modest corner radius; no pill-shaped buttons.
- No purple gradients. No dashes in UI copy. No generic AI marketing copy. No "AI-powered" tags in text or images.
- Proper favicon before anything goes live.
- neutral light background, dark text, one restrained accent color for progress, and a clean sans serif with tabular figures so numbers line up.

## Features and Behavior

### Add earnings from a screenshot
Source: `scope.md > The POC Boundary`.

The person uploads a screenshot of a weekly earnings summary from any gig app. The app reads it and fills a review card per entry found.

- As a gig worker, I want to upload my weekly earnings screen so that I don't have to type my hours and pay.
  - [ ] Uploading a sample screenshot shows a short reading state, then a review card with platform name, week start and end dates, active hours and earnings filled in, plus an optional **Business expenses** field (0 by default, never read from the screenshot).
  - [ ] Hours read are **active time** (on a trip or task), not online time. If the screenshot shows both, active time is used.
  - [ ] Every field on the review card can be edited before adding.
  - [ ] Nothing is added to the month until **Add to month** is tapped; **Cancel** discards it.
  - [ ] The screenshot itself is not kept after reading (see `Privacy`).

### Add earnings manually
- As a gig worker without a screenshot, I want to type a week's numbers so that every gig counts.
  - [ ] The manual form has the same fields as the review card: platform name, week start, week end, active hours, earnings, business expenses (optional, 0 by default).
  - [ ] **Add to month** is disabled until all fields are valid (hours, earnings and expenses are zero or more, end date not before start date).

### Month totals and progress
Source: `scope.md > The Unique Kernel`.

- As a gig worker, I want one clear number so that I know in a second where my month stands.
  - [ ] **This Month** shows total active hours and total earnings after expenses counted for the month.
  - [ ] The $580 test uses earnings minus business expenses. A short note says the state uses household income (MAGI) and this only counts the person's gig earnings.
  - [ ] The dominant number is the test closer to its line as a share of its threshold (hours / 80 vs earnings after expenses / $580). The other test appears smaller below.
  - [ ] Each test shows its gap to the line ("17.5 hours to go", "$120 to go") or, once reached, a met state ("80 hours reached").
  - [ ] Days left in the month is shown (calendar days after today). For a month that has ended, it says the month has ended.
  - [ ] Adding, editing or removing an entry updates the totals immediately.

### Weeks that span two months
- [ ] When an entry's dates cross a month boundary, its hours and earnings are split **in proportion to the number of days in each month** (for example, Sep 29 to Oct 5 counts 5/7 toward October and 2/7 toward September).
- [ ] The entry list and the summary show the amount counted for the month and mark the entry as prorated.

### Entries list
- [ ] Each entry shows platform, dates, hours and earnings counted this month.
- [ ] An entry can be edited or removed.
- [ ] adding an entry with the same platform and dates as an existing one shows a "looks like this week is already added" warning, with the option to add anyway.

### Monthly summary
Source: `scope.md > What "Working" Looks Like`.

- As a gig worker, I want a one-page summary so that I have something to keep or show if asked.
  - [ ] The page shows: the month, a table of entries (platform, dates, active hours counted, earnings, expenses and earnings after expenses counted, prorated marker), totals, both federal thresholds with the result shown as numbers (reached or gap), and the date it was generated.
  - [ ] It carries the honesty note: this is a personal record of numbers against federal thresholds, not a decision; only the state Medicaid agency decides; link to Medicaid.gov.
  - [ ] **Print or save as PDF** produces a clean single page on letter size, without app navigation.
  - [ ] If sample data is in use, the page is clearly labeled **Sample data**.

### Sample data
- [ ] **Try with sample data** loads clearly labeled sample screenshots from fictional gig platforms (no real brand names or logos) so the full flow, including reading screenshots, can be demonstrated.
- [ ] While sample data is in use, a visible **Sample data** label is shown on **This Month** and on the summary, with a way to clear it.

### Honesty note
Source: `scope.md > Explicitly Cut`.

- [ ] No screen ever says "you are eligible", "you keep your coverage" or equivalent.
- [ ] A short note near the numbers says the app compares your numbers to federal thresholds and only your state agency decides, with a link to Medicaid.gov.
- [ ] Threshold values shown in the app match the official CMS source cited in `spec.md`.

### Privacy
- [ ] Screenshots are processed to read the numbers and not stored by default.
- [ ] The entries (numbers only) are kept on the person's phone so they're there next time; there is no account.
- [ ] A **Clear my data** action removes all saved entries from the device.
- [ ] The **Privacy** page explains, in a few plain sentences: what is sent to be read, what is kept, where, and how to clear it.

## States and Boundaries

- **First use / empty month** — **This Month** shows month, days left, the two tests at zero, **Add earnings** as the main action and **Try with sample data**.
- **Reading** — after upload, a short reading state; the person can cancel.
- **Unreadable screenshot** — if the image isn't an earnings summary or the numbers can't be read: "We couldn't find hours and earnings in this image." Options: try another screenshot or enter manually.
- **Partly read** — fields that couldn't be read are left empty and highlighted; **Add to month** stays disabled until they're filled.
- **No active time on screenshot** — the hours field is left empty and highlighted with a short hint that active time is what counts.
- **Entry outside the month** — entries are saved with their dates; they count toward the month(s) their dates fall in. **This Month** can switch to the previous month so a person can still finish and print last month's summary early in the new month.
- **Threshold reached** — the met test shows a reached state with the number; still no eligibility claim.
- **Coming back** — saved entries load from the phone; totals and days left are recalculated for today.
- **Data cleared** — back to the empty state.

## Product Decisions

- **Active time counts toward 80 hours, not online time** — most defensible in front of an agency and avoids inflating the number.
- **Weeks spanning two months are prorated by days** — keeps each month's total fair without asking the person to split it by hand.
- **The dominant number is whichever test is closer to its line** — shows the person their most likely path to meeting a test.
- **Entries are kept on the phone** — the weekly loop needs numbers to still be there; no accounts in this proof of concept.
- **Earnings after expenses count toward $580** — CMS uses MAGI-based household income (`spec.md` cites the source); for gig work that is roughly earnings after business expenses, so comparing gross pay to $580 could mislead. Added during `4-spec` with the learner's agreement.
- **Review before counting** — what's read from a screenshot never counts until the person confirms it.
- **Never an eligibility verdict** — only the state agency decides (`scope.md > Explicitly Cut`).

## What We're Building

- **This Month** with dominant number, progress, gaps, days left, secondary test, entries list.
- Add earnings by screenshot (read automatically) with an editable review step.
- Add earnings manually.
- Optional business expenses per entry; the $580 test uses earnings after expenses.
- Proration for weeks spanning two months.
- Edit and remove entries.
- Monthly summary page, printable or saved as PDF.
- Sample data with fictional platforms, clearly labeled.
- Honesty note with Medicaid.gov link.
- Entries kept on the device, **Clear my data**, and a **Privacy** page.

## Deferred From the POC

- **Accounts and sync across devices** — implied by "keep my numbers"; on-device storage is enough to prove the loop.
- **Other qualifying activities** (volunteering, school, job training) and combining them with work hours — the kernel is gig work.
- **Exemption screening** — separate, complex rules; out for now.
- **Submitting to a state** — state portals differ and the app does not decide anything.

## Possible Later Enhancements

- State-specific guidance and portals.
- Weekly reminders to add earnings.
- Multiple languages, starting with Spanish.
- A history of past months.

## Non-Goals

- Telling anyone they are eligible or will keep coverage — only the state agency decides.
- Storing screenshots — privacy by default.
- Invented stats, testimonials or user counts anywhere — no fake data.
- Real gig platform names or logos in sample data or the demo video — trademark and honesty.
- Connecting to gig platform accounts or bank accounts — beyond a proof of concept and a privacy risk.

## Open Questions

- **Earnings definition** — resolved in `4-spec`: earnings (tips included) minus optional business expenses, with a household income (MAGI) note.
- **Exact thresholds** — resolved in `4-spec`: 80 hours and $580 (80 x $7.25, federal minimum wage), cited in `spec.md`.
- **Project name** — resolved in `6-ship`: HourProof.
- **Visual details** — confirmed as written under `Look and Feel`; exact accent color and typeface chosen in `4-spec`.
