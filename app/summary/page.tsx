import type { Metadata } from "next";
import { Suspense } from "react";
import { MonthlySummary } from "@/components/MonthlySummary";

export const metadata: Metadata = { title: "Monthly summary | HourProof" };

export default function SummaryPage() {
  // MonthlySummary reads ?month= from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" />}>
      <MonthlySummary />
    </Suspense>
  );
}
