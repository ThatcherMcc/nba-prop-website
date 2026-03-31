import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getPlayerNames } from "@/lib/data";
import { auth } from "@/lib/auth";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import MobileTabBar from "./components/MobileTabBar";
import CookieConsentBanner from "./components/CookieConsentBanner";
import CommandPaletteProvider from "./components/CommandPaletteProvider";
import ThemeLayoutProvider from "./components/ThemeLayoutContext";

const SITE_URL = "https://propedge.bet";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/site.webmanifest",
  title: {
    default: "PropEdge — NBA Player Prop Trends & Analytics",
    template: "%s | PropEdge",
  },
  description:
    "Find your edge with real-time NBA player prop trends, hot streaks, and cold spells. Data-driven prop betting analytics updated daily.",
  keywords: [
    "NBA props",
    "player props",
    "NBA betting analytics",
    "prop trends",
    "NBA hot streaks",
    "player prop lines",
    "NBA statistics",
    "prop betting",
    "NBA player stats",
    "over under props",
  ],
  authors: [{ name: "PropEdge" }],
  creator: "PropEdge",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "PropEdge",
    title: "PropEdge — NBA Player Prop Trends & Analytics",
    description:
      "Find your edge with real-time NBA player prop trends, hot streaks, and cold spells. Data-driven prop betting analytics updated daily.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PropEdge — NBA Player Prop Trends & Analytics",
    description:
      "Find your edge with real-time NBA player prop trends, hot streaks, and cold spells.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#120c08",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [playerNames, session] = await Promise.all([
    getPlayerNames(),
    auth(),
  ]);

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "PropEdge",
              url: "https://propedge.bet",
              description:
                "NBA player prop trends and analytics updated daily. Track hot streaks, cold spells, and prop line edges.",
              applicationCategory: "SportsApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="page-shell min-h-screen bg-pe-bg text-pe-text-body antialiased">
        <ThemeLayoutProvider>
          <CommandPaletteProvider playerNames={playerNames}>
            <div className="site-frame mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 md:px-6">
              <NavBar session={session} />
              <main className="flex-1 px-0 pb-24 pt-6 md:pb-10 md:pt-8">
                {children}
              </main>
              <Footer />
            </div>
            <MobileTabBar session={session} />
            <CookieConsentBanner />
          </CommandPaletteProvider>
        </ThemeLayoutProvider>
      </body>
    </html>
  );
}
