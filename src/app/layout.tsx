import type { Metadata } from "next";
import { JetBrains_Mono, Work_Sans } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BetSlip } from "@/features/betting/bet-slip";
import { getCurrentUser } from "@/lib/auth/dal";
import { reverbConfig } from "@/lib/env";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const display = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const body = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "0dds.bet · Live esports odds", template: "%s · 0dds.bet" },
  description:
    "Live CS2, Valorant, Dota 2 and LoL odds with one-tap bet slips and a play-money wallet. 1,000 free credits. 18+.",
};

/** The slip needs to know whether to offer "Place bet" or "Log in", which reads the session cookie. */
async function SessionAwareBetSlip() {
  const user = await getCurrentUser();

  return <BetSlip signedIn={user !== null} />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders reverb={reverbConfig}>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
          <Suspense fallback={null}>
            <SessionAwareBetSlip />
          </Suspense>
          <Toaster theme="dark" position="top-center" richColors />
        </AppProviders>
      </body>
    </html>
  );
}
