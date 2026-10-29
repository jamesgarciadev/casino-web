import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Casino", template: "%s · Casino" },
  description: "Slots, live dealers and table games.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders>
          <SiteHeader />
          <MobileNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
