// Federal Medicaid community engagement thresholds (CMS-2454-IFC, June 1, 2026).
// 80 hours per month of qualifying activity, or monthly income of at least the
// federal minimum wage times 80 hours ($7.25 x 80 = $580 in 2026). States must use
// the federal minimum wage, not state or local rates (42 CFR 435.552).
// Sources:
//   https://www.cms.gov/newsroom/fact-sheets/medicaid-community-engagement-requirement-certain-individuals-interim-final-rule-comment-period-cms
//   https://www.medicaid.gov/medicaid/downloads/ce-requirement-ifc-deck.pdf (slides 11 and 13)
export const HOURS_THRESHOLD = 80;
export const FEDERAL_MIN_WAGE = 7.25;
export const INCOME_THRESHOLD = HOURS_THRESHOLD * FEDERAL_MIN_WAGE; // 580
