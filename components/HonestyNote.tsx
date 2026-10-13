import { Info } from "lucide-react";

export const HOUSEHOLD_NOTE =
  "Your state looks at your household income. This only counts your gig earnings after expenses.";

export function HonestyNote() {
  return (
    <aside className="flex gap-3 rounded-lg bg-surface p-4 text-sm leading-relaxed text-muted ring-1 ring-line">
      <Info className="mt-0.5 size-[18px] shrink-0 text-ink" strokeWidth={1.75} aria-hidden />
      <p>
        These are your numbers compared with the federal thresholds. Only your state Medicaid agency decides.{" "}
        <a
          href="https://www.medicaid.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent underline underline-offset-2 hover:text-accent-strong"
        >
          Medicaid.gov
        </a>
      </p>
    </aside>
  );
}
