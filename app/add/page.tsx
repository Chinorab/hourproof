import { Suspense } from "react";
import { AddFlow } from "@/components/AddFlow";

export default function AddPage() {
  // AddFlow reads ?edit= from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" />}>
      <AddFlow />
    </Suspense>
  );
}
