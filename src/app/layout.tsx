import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getPlayerNames } from "@/lib/data";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import MobileTabBar from "./components/MobileTabBar";
import CommandPaletteProvider from "./components/CommandPaletteProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropEdge — NBA player prop trends & analytics",
  description:
    "Find your edge with real-time NBA player prop trends, hot streaks, and cold spells. Data-driven prop betting analytics updated daily.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const playerNames = await getPlayerNames();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30`}
      >
        <CommandPaletteProvider playerNames={playerNames}>
          <NavBar />
          <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
            {children}
          </main>
          <Footer />
          <MobileTabBar />
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
