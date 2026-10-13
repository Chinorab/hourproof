# HourProof

See where your gig work month stands against the federal Medicaid work requirement, from your phone.

Under the CMS interim final rule of June 1, 2026 (CMS-2454-IFC), many adults aged 19 to 64 in Medicaid expansion states must show 80 hours of qualifying activity a month, or monthly income of at least the federal minimum wage times 80 hours ($580 in 2026). States must start enforcing it by January 1, 2027. Gig and seasonal workers are the most exposed: their hours are irregular, split across several apps, and often missing from the payroll data states match against.

HourProof turns weekly earnings screenshots into one clear number for the month.

## What it does

- **Read a screenshot.** Upload a weekly earnings summary from any gig app. Claude reads the app name, dates, active hours and earnings. Anything it cannot see is left blank instead of guessed.
- **Review before it counts.** Every value is editable. Add optional business expenses. Nothing is added until you confirm.
- **One big number.** This Month shows whichever test is closer to its line (80 active hours, or $580 earned after expenses), the gap, and the days left. Weeks that cross into another month are prorated by day.
- **Monthly summary.** A one page summary you can print or save as PDF.
- **Sample data.** Try the full flow with three labeled sample screenshots of fictional apps.

HourProof never says you are eligible or that you keep your coverage. It shows your numbers against the federal thresholds; only your state Medicaid agency decides.

## Run it locally

Requires Node.js 20 or later and a Claude API key from [console.anthropic.com](https://console.anthropic.com).

```bash
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000 in your browser's phone view.

Other scripts:

```bash
npm test          # unit tests for the month math (proration, thresholds, days left)
npm run build     # production build
npm run samples   # re-render the sample screenshots in public/samples
```

### Environment variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key. When set, screenshots are read with Claude Opus 5.5 on the Claude API. |
| `AWS_REGION`, `AWS_BEARER_TOKEN_BEDROCK` or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`, `BEDROCK_MODEL_ID` | Optional alternative: read screenshots with Claude on Amazon Bedrock when `ANTHROPIC_API_KEY` is empty. |

Keys live only in `.env.local` (ignored by git) or in your hosting provider's environment settings.

## Deploy

The app is a single Next.js project that deploys to Vercel as is. Import the repository in Vercel, add `ANTHROPIC_API_KEY` under Project Settings, Environment Variables, and deploy. Set a spend limit on the API key.

## How it works

- `app/api/extract/route.ts` is the only server code. It receives a shrunk screenshot, sends it to Claude with a strict schema (`lib/extract.ts`), and returns the fields it found. The image is not stored or logged.
- Everything else runs in the browser. Entries are kept in `localStorage` on the device (`lib/storage.ts`), and all the month math lives in `lib/month.ts`.
- Thresholds are defined once in `lib/thresholds.ts` with their sources.

## Privacy

Screenshots are sent to Anthropic's Claude API to be read and are not stored by HourProof. Entries stay in the browser on your device; there are no accounts. See the in-app Privacy page.

## Sources

- CMS fact sheet, Medicaid Community Engagement Requirement for Certain Individuals Interim Final Rule (CMS-2454-IFC): https://www.cms.gov/newsroom/fact-sheets/medicaid-community-engagement-requirement-certain-individuals-interim-final-rule-comment-period-cms
- Medicaid.gov IFC overview deck (slides 11 and 13, 42 CFR 435.552): https://www.medicaid.gov/medicaid/downloads/ce-requirement-ifc-deck.pdf
- Federal Register, Medicaid Program; Community Engagement Requirement for Certain Individuals: https://www.federalregister.gov/documents/2026/06/03/2026-11094/medicaid-program-community-engagement-requirement-for-certain-individuals

The income test uses earnings after business expenses because CMS directs states to use MAGI based household income. HourProof only counts the gig earnings you enter, so the summary says so.

## Sample data

The images in `public/samples` are sample screenshots of fictional apps (Sample Courier, Sample Rides, Sample Cleaning), each marked SAMPLE. They are generated from the HTML in `scripts/make-samples`. No real platform names or logos are used.

## License

[MIT](LICENSE)
