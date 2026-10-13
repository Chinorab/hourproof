import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "Privacy | HourProof" };

const link = "font-medium text-accent underline underline-offset-2 hover:text-accent-strong";

export default function PrivacyPage() {
  return (
    <div>
      <Link href="/" className="-ml-1 inline-flex h-10 items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
        This month
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Privacy</h1>

      <div className="mt-5 space-y-5 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-semibold">Your screenshots</h2>
          <p className="mt-1 text-muted">
            When you upload a screenshot, it is shrunk on your phone and sent to Anthropic&apos;s Claude API to read the
            hours and earnings. HourProof does not store the image. Anthropic handles it under its{" "}
            <a href="https://www.anthropic.com/legal/commercial-terms" className={link} target="_blank" rel="noopener noreferrer">
              commercial terms
            </a>{" "}
            and{" "}
            <a href="https://www.anthropic.com/legal/privacy" className={link} target="_blank" rel="noopener noreferrer">
              privacy policy
            </a>
            , which say it does not train its models on this content.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Your numbers</h2>
          <p className="mt-1 text-muted">
            The entries you add (app name, dates, hours, earnings and expenses) are saved only in this browser on this
            device. There are no accounts and nothing is sent to an HourProof server for storage.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Removing your data</h2>
          <p className="mt-1 text-muted">
            Use Clear my data at the bottom of the main screen to remove every entry from this device. Clearing your
            browser&apos;s site data does the same.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">What HourProof is not</h2>
          <p className="mt-1 text-muted">
            HourProof is not a government website and does not decide anything about your coverage. Only your state
            Medicaid agency decides.
          </p>
        </section>
      </div>
    </div>
  );
}
