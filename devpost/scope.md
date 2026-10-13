---
doc: scope
status: approved
---

# HourProof (working name)

A phone-first tool that turns a gig worker's scattered earnings screenshots into one clear answer: where this month stands against the federal Medicaid work requirement, plus a one-page summary they can keep as proof.

## The Unique Kernel
Snap or upload a weekly earnings summary from any gig app, and the app reads hours and income per gig, totals the month, and shows in one dominant number how close you are to 80 hours or $580, how far from the line you are, and how many days are left. Then it hands you a clean monthly summary page. It reports numbers against federal thresholds; it never claims you are eligible.

## Who It's For
An adult aged 19 to 64 on Medicaid in an expansion state who earns through gig and seasonal work: delivery, rideshare, cleaning, odd jobs. Their hours are irregular and split across several apps, and they often don't show up in the payroll data states match against. They're on a phone, stressed, and not a paperwork person. Today they have no single place to see the month add up; they'd be piecing it together from app screens, or not at all, until a state notice arrives.

## The Core Loop
They open the app, add this month's earnings (a screenshot of a weekly summary, or manual entry), check what was read, and see the month's totals update against both tests with the days remaining. They come back each week as new earnings come in, and at month's end they save the summary page.

## Inspiration & Identity
Calm, trustworthy, mobile-first: a well-made banking or tax app, not a startup landing page. One dominant number on the main screen with a clear progress state. Plain, short headlines. No purple gradients, no pill-shaped buttons, no emojis (an icon set instead), no dashes in UI copy, no generic AI marketing copy, no "AI-powered" tags anywhere. Proper favicon before going live.

## Why This Matters to the Learner
Two goals in their words: "master the Claude vision API, and get something working." The context is real and current: the CMS interim final rule (June 1, 2026) has states enforcing no later than January 1, 2027, and a missed month can mean losing coverage for the workers most likely to fall through the cracks.

## What "Working" Looks Like
On a phone, with clearly labeled sample data from fictional gig platforms: upload one or more weekly earnings screenshots, watch hours and income appear per gig, see the month total against 80 hours and $580 with the gap and days left, then open a one-page monthly summary ready to print or save as PDF. The "oh, that's cool" beat: a screenshot goes in, and seconds later the big number moves and tells you exactly how far you are from the line.

## The POC Boundary
- Add earnings by screenshot (read with the Claude API) or by manual entry.
- Per-gig hours and income, editable before they count.
- Month totals against both federal tests, the gap to each line, days left in the month.
- One-page monthly summary (printable page or PDF).
- Honesty layer: a short visible note that only the state agency decides, with a link to Medicaid.gov. Thresholds verified against the official CMS fact sheet in `4-spec`.
- Privacy: screenshots processed, not stored by default; a short privacy page.
- Sample data clearly labeled, fictional platform names, no third-party trademarks.
- Repo basics: secrets in environment variables with `.env.example`, MIT license.

## Later
- Exemption screening.
- State-specific portals and submission.
- Accounts.
- Reminders.
- Multiple languages.

## Explicitly Cut
- Any eligibility verdict ("you are eligible", "you keep your coverage"): only the state agency decides, so the app must never say it.
- Invented stats, testimonials or user counts: no fake data anywhere.
- Real gig platform names or logos in demo data or the video: trademark risk and honesty.
