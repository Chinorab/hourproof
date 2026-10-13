import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HourProof",
  description: "See where your gig work month stands against the federal Medicaid work requirement.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f6f3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full`}>
      <body className="min-h-full">
        <a
          href="#main"
          className="sr-only rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-10"
        >
          Skip to content
        </a>
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-4">
          <header className="flex items-center justify-between py-4">
            <Link href="/" translate="no" className="text-base font-semibold tracking-tight text-ink">
              HourProof
            </Link>
          </header>
          <main id="main" className="flex-1 pb-10">{children}</main>
          <footer className="border-t border-line py-5 text-sm text-muted">
            <p>Not a government website. Your numbers stay on this device.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
