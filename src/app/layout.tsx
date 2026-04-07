import type { Metadata } from "next";
import { Outfit, Fira_Code } from "next/font/google";
import SecurityWrapper from "@/components/layout/SecurityWrapper";
import CommandPalette from "@/components/layout/CommandPalette";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Advanced Metadata & SEO specific for Noble Terminal
export const metadata: Metadata = {
  title: "Noble Terminal | Institutional Market Intelligence",
  description: "Advanced institutional-grade financial trading terminal featuring real-time macro indicators, full market depth, and instant algorithmic news feed.",
  keywords: ["trading terminal", "forex data", "order flow", "live charts", "market intelligence", "prop firm", "noble funded"],
  robots: "index, follow",
  openGraph: {
    title: "Noble Terminal | Institutional Intelligence",
    description: "Professional multi-asset market data platform directly serving modern prop firms and institutional traders.",
    url: "https://terminal.noblefunded.com",
    siteName: "Noble Terminal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noble Terminal - Institutional Grade Trading",
    description: "Experience absolute market transparency.",
    creator: "@noblefunded",
  },
  icons: {
    icon: "/favicon.ico", // Ensure you upload a real favicon to public/
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${firaCode.variable}`}
      suppressHydrationWarning
    >
      <body className="terminal-root" suppressHydrationWarning>
        <SecurityWrapper>
          <CommandPalette />
          {children}
        </SecurityWrapper>
      </body>
    </html>
  );
}
